const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const Guild = require('../../../../shared/models/Guild');

// ── Hilfsfunktion: Transcript als Text ────────────────────────
async function generateTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();
  let transcript = `=== Ticket-Transcript: ${channel.name} ===\n`;
  transcript += `Erstellt: ${new Date().toLocaleString('de-DE')}\n\n`;
  for (const msg of sorted) {
    if (msg.author.bot && msg.embeds.length && !msg.content) continue;
    const time = msg.createdAt.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    transcript += `[${time}] ${msg.author.username}: ${msg.content || '[Embed]'}\n`;
  }
  return transcript;
}

// ── Panel senden ───────────────────────────────────────────────
async function sendPanel(channel, tickets, panelConfig) {
  const embed = new EmbedBuilder()
    .setTitle(panelConfig.title || '🎫 Support-Tickets')
    .setDescription(panelConfig.description || 'Klicke auf einen Button um ein Ticket zu erstellen.')
    .setColor(panelConfig.color || '#5865F2')
    .setFooter({ text: panelConfig.footer || 'Support-System' });

  if (panelConfig.image) embed.setImage(panelConfig.image);

  const types = panelConfig.types?.length ? panelConfig.types : [{ id: 'support', label: 'Support', emoji: '🎫' }];

  let row;
  if (types.length <= 5) {
    row = new ActionRowBuilder().addComponents(
      ...types.map(t => new ButtonBuilder()
        .setCustomId(`ticket_create_${t.id}`)
        .setLabel(t.label)
        .setEmoji(t.emoji || '🎫')
        .setStyle(ButtonStyle.Primary)
      )
    );
  } else {
    row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_create_select')
        .setPlaceholder('Ticket-Typ wählen...')
        .addOptions(types.map(t => ({ label: t.label, value: t.id, emoji: t.emoji || '🎫', description: t.description || '' })))
    );
  }

  return channel.send({ embeds: [embed], components: [row] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket-System')
    .addSubcommand(s => s.setName('panel').setDescription('Panel in diesem Kanal senden'))
    .addSubcommand(s => s.setName('open').setDescription('Ticket öffnen')
      .addStringOption(o => o.setName('typ').setDescription('Ticket-Typ').setRequired(false))
      .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false)))
    .addSubcommand(s => s.setName('close').setDescription('Ticket schließen')
      .addStringOption(o => o.setName('grund').setDescription('Schliessungsgrund')))
    .addSubcommand(s => s.setName('claim').setDescription('Ticket beanspruchen'))
    .addSubcommand(s => s.setName('unclaim').setDescription('Ticket freigeben'))
    .addSubcommand(s => s.setName('rename').setDescription('Ticket umbenennen')
      .addStringOption(o => o.setName('name').setDescription('Neuer Name').setRequired(true)))
    .addSubcommand(s => s.setName('add').setDescription('Nutzer hinzufügen')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Nutzer entfernen')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true)))
    .addSubcommand(s => s.setName('transcript').setDescription('Transcript erstellen'))
    .addSubcommand(s => s.setName('move').setDescription('Ticket-Typ ändern')
      .addStringOption(o => o.setName('typ').setDescription('Neuer Typ').setRequired(true)))
    .addSubcommand(s => s.setName('priority').setDescription('Priorität setzen')
      .addStringOption(o => o.setName('stufe').setDescription('Priorität').setRequired(true)
        .addChoices(
          { name: '🔴 Hoch', value: 'high' },
          { name: '🟡 Mittel', value: 'medium' },
          { name: '🟢 Niedrig', value: 'low' }
        )))
    .addSubcommand(s => s.setName('hold').setDescription('Ticket auf Wartestellung setzen'))
    .addSubcommand(s => s.setName('unhold').setDescription('Wartestellung aufheben')),

  sendPanel,

  async execute(interaction, client) {
    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    const tickets = guildData?.modules?.tickets;
    if (!tickets?.enabled) return interaction.reply({ content: '❌ Ticket-Modul ist deaktiviert.', ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const ch = interaction.channel;
    const isTicket = ch.name?.startsWith('ticket-') || ch.topic?.includes('ticket-owner:');

    // ── PANEL ──────────────────────────────────────────────────
    if (sub === 'panel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ content: '❌ Keine Berechtigung.', ephemeral: true });
      await sendPanel(ch, tickets, tickets.panels?.[0] || {});
      return interaction.reply({ content: '✅ Panel gesendet!', ephemeral: true });
    }

    // ── OPEN ───────────────────────────────────────────────────
    if (sub === 'open') {
      return openTicket(interaction, tickets, interaction.options.getString('typ') || 'support', interaction.options.getString('grund') || 'Kein Grund angegeben');
    }

    // ── CLAIM ──────────────────────────────────────────────────
    if (sub === 'claim') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      await ch.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true, SendMessages: true });
      const embed = new EmbedBuilder().setColor('#00FF00').setDescription(`✅ **${interaction.user.username}** hat dieses Ticket beansprucht.`).setTimestamp();
      await ch.send({ embeds: [embed] });
      await ch.setTopic(`ticket-owner:${interaction.user.id} | claimed:${interaction.user.id}`);
      return interaction.reply({ content: '✅ Ticket beansprucht!', ephemeral: true });
    }

    // ── UNCLAIM ────────────────────────────────────────────────
    if (sub === 'unclaim') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      const topic = (ch.topic || '').replace(/claimed:[^\s|]+\s?\|?\s?/g, '');
      await ch.setTopic(topic.trim());
      await ch.send({ embeds: [new EmbedBuilder().setColor('#FFA500').setDescription(`🔓 Ticket wurde von **${interaction.user.username}** freigegeben.`)] });
      return interaction.reply({ content: '✅ Ticket freigegeben.', ephemeral: true });
    }

    // ── RENAME ─────────────────────────────────────────────────
    if (sub === 'rename') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      const name = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-');
      await ch.setName(`ticket-${name}`);
      return interaction.reply({ content: `✅ Ticket umbenannt zu **ticket-${name}**.` });
    }

    // ── PRIORITY ───────────────────────────────────────────────
    if (sub === 'priority') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      const p = interaction.options.getString('stufe');
      const labels = { high: '🔴 Hoch', medium: '🟡 Mittel', low: '🟢 Niedrig' };
      await ch.send({ embeds: [new EmbedBuilder().setColor(p === 'high' ? '#FF0000' : p === 'medium' ? '#FFFF00' : '#00FF00').setDescription(`📌 Priorität gesetzt auf: **${labels[p]}**`)] });
      return interaction.reply({ content: `✅ Priorität: ${labels[p]}`, ephemeral: true });
    }

    // ── HOLD ───────────────────────────────────────────────────
    if (sub === 'hold') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      // Nutzer kann nicht mehr schreiben – nur Support-Rolle
      const ownerMatch = (ch.topic || '').match(/ticket-owner:(\d+)/);
      if (ownerMatch) await ch.permissionOverwrites.edit(ownerMatch[1], { SendMessages: false });
      await ch.send({ embeds: [new EmbedBuilder().setColor('#FFA500').setDescription('⏳ **Ticket auf Wartestellung gesetzt.**\nDer Support wartet auf weitere Informationen. Du wirst benachrichtigt sobald das Ticket wieder aktiv ist.').setTimestamp()] });
      return interaction.reply({ content: '✅ Ticket auf Wartestellung.', ephemeral: true });
    }

    // ── UNHOLD ─────────────────────────────────────────────────
    if (sub === 'unhold') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      const ownerMatch = (ch.topic || '').match(/ticket-owner:(\d+)/);
      if (ownerMatch) await ch.permissionOverwrites.edit(ownerMatch[1], { SendMessages: true });
      await ch.send({ embeds: [new EmbedBuilder().setColor('#00FF00').setDescription('✅ **Wartestellung aufgehoben.**\nDas Ticket ist wieder aktiv.').setTimestamp()] });
      return interaction.reply({ content: '✅ Wartestellung aufgehoben.', ephemeral: true });
    }

    // ── TRANSCRIPT ─────────────────────────────────────────────
    if (sub === 'transcript') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      await interaction.deferReply({ ephemeral: true });
      const text = await generateTranscript(ch);
      const buf = Buffer.from(text, 'utf-8');
      await interaction.editReply({ content: '✅ Transcript erstellt:', files: [{ attachment: buf, name: `transcript-${ch.name}.txt` }] });
      if (tickets.logChannelId) {
        const logCh = interaction.guild.channels.cache.get(tickets.logChannelId);
        logCh?.send({ content: `📋 Transcript für **${ch.name}**:`, files: [{ attachment: buf, name: `transcript-${ch.name}.txt` }] });
      }
      return;
    }

    // ── MOVE ───────────────────────────────────────────────────
    if (sub === 'move') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      const typ = interaction.options.getString('typ');
      const panel = tickets.panels?.find(p => p.types?.some(t => t.id === typ));
      const catId = panel?.types?.find(t => t.id === typ)?.categoryId || tickets.categoryId;
      if (catId) await ch.setParent(catId, { lockPermissions: false });
      await ch.send({ embeds: [new EmbedBuilder().setColor('#5865F2').setDescription(`📂 Ticket verschoben nach: **${typ}**`)] });
      return interaction.reply({ content: `✅ Ticket nach **${typ}** verschoben.`, ephemeral: true });
    }

    // ── ADD ────────────────────────────────────────────────────
    if (sub === 'add') {
      const target = interaction.options.getUser('nutzer');
      await ch.permissionOverwrites.create(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      return interaction.reply({ content: `✅ <@${target.id}> wurde hinzugefügt.` });
    }

    // ── REMOVE ─────────────────────────────────────────────────
    if (sub === 'remove') {
      const target = interaction.options.getUser('nutzer');
      await ch.permissionOverwrites.delete(target.id);
      return interaction.reply({ content: `✅ <@${target.id}> wurde entfernt.` });
    }

    // ── CLOSE ──────────────────────────────────────────────────
    if (sub === 'close') {
      if (!isTicket) return interaction.reply({ content: '❌ Kein Ticket-Kanal.', ephemeral: true });
      const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
      await interaction.deferReply();

      // Transcript erstellen
      const text = await generateTranscript(ch);
      const buf = Buffer.from(text, 'utf-8');

      // Log
      if (tickets.logChannelId) {
        const logCh = interaction.guild.channels.cache.get(tickets.logChannelId);
        const ownerMatch = (ch.topic || '').match(/ticket-owner:(\d+)/);
        const logEmbed = new EmbedBuilder()
          .setTitle('🔒 Ticket geschlossen')
          .setColor('#FF0000')
          .addFields(
            { name: 'Kanal', value: ch.name, inline: true },
            { name: 'Geschlossen von', value: interaction.user.username, inline: true },
            { name: 'Ersteller', value: ownerMatch ? `<@${ownerMatch[1]}>` : 'Unbekannt', inline: true },
            { name: 'Grund', value: grund }
          )
          .setTimestamp();
        logCh?.send({ embeds: [logEmbed], files: [{ attachment: buf, name: `transcript-${ch.name}.txt` }] });
      }

      // Bewertungs-Button senden
      if (tickets.ratingEnabled) {
        const ownerMatch = (ch.topic || '').match(/ticket-owner:(\d+)/);
        const owner = ownerMatch ? await interaction.guild.members.fetch(ownerMatch[1]).catch(() => null) : null;
        if (owner) {
          const ratingRow = new ActionRowBuilder().addComponents(
            ...[1, 2, 3, 4, 5].map(n => new ButtonBuilder().setCustomId(`ticket_rate_${n}`).setLabel('⭐'.repeat(n)).setStyle(ButtonStyle.Secondary))
          );
          owner.send({ content: `Wie war dein Support-Erlebnis in **${ch.name}**?`, components: [ratingRow] }).catch(() => {});
        }
      }

      // Kanal in 5s löschen
      await interaction.editReply({ content: `🔒 Ticket wird in 5 Sekunden geschlossen...\n📝 Grund: ${grund}` });
      setTimeout(() => ch.delete().catch(console.error), 5000);
    }
  }
};

// ── Ticket öffnen (auch von Button/Select aufgerufen) ─────────
async function openTicket(interaction, tickets, typId, grund) {
  const panel = tickets.panels?.find(p => p.types?.some(t => t.id === typId));
  const typeConfig = panel?.types?.find(t => t.id === typId) || {};
  const categoryId = typeConfig.categoryId || tickets.categoryId;

  // Max-Tickets-Check
  const existing = interaction.guild.channels.cache.find(c => c.topic?.includes(`ticket-owner:${interaction.user.id}`));
  const maxTickets = tickets.maxTickets || 1;
  if (existing && maxTickets === 1)
    return interaction.reply({ content: `❌ Du hast bereits ein offenes Ticket: ${existing}`, ephemeral: true });

  try {
    const ticketNum = Date.now().toString().slice(-4);
    const channelName = `${typeConfig.prefix || 'ticket'}-${interaction.user.username}-${ticketNum}`;

    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId || null,
      topic: `ticket-owner:${interaction.user.id} | type:${typId} | grund:${grund}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
        ...(tickets.supportRoleId ? [{ id: tickets.supportRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.AttachFiles] }] : []),
        ...(typeConfig.extraRoleId ? [{ id: typeConfig.extraRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
      ]
    });

    // Willkommens-Embed
    const welcomeMsg = (typeConfig.message || tickets.message || 'Hallo {user}! Das Support-Team wird sich bald melden.')
      .replace('{user}', `<@${interaction.user.id}>`)
      .replace('{type}', typeConfig.label || typId);

    const embed = new EmbedBuilder()
      .setTitle(`${typeConfig.emoji || '🎫'} ${typeConfig.label || 'Support-Ticket'} #${ticketNum}`)
      .setDescription(welcomeMsg)
      .setColor(typeConfig.color || '#5865F2')
      .addFields(
        { name: '👤 Erstellt von', value: `<@${interaction.user.id}>`, inline: true },
        { name: '📋 Typ', value: typeConfig.label || typId, inline: true },
        { name: '📝 Grund', value: grund, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Nutze die Buttons um das Ticket zu verwalten' });

    // Aktions-Buttons
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ticket_close_btn').setLabel('🔒 Schließen').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_claim_btn').setLabel('✋ Beanspruchen').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ticket_hold_btn').setLabel('⏳ Wartestellung').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('ticket_transcript_btn').setLabel('📋 Transcript').setStyle(ButtonStyle.Secondary),
    );

    const ping = tickets.supportRoleId ? `<@&${tickets.supportRoleId}>` : '';
    await channel.send({ content: `${ping} <@${interaction.user.id}>`, embeds: [embed], components: [actionRow] });

    // Log
    if (tickets.logChannelId) {
      const logCh = interaction.guild.channels.cache.get(tickets.logChannelId);
      logCh?.send({ embeds: [new EmbedBuilder().setColor('#00FF00').setTitle('🎫 Ticket geöffnet').addFields(
        { name: 'Kanal', value: `${channel}`, inline: true },
        { name: 'Ersteller', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Typ', value: typeConfig.label || typId, inline: true },
        { name: 'Grund', value: grund }
      ).setTimestamp()] });
    }

    return interaction.reply({ content: `✅ Ticket erstellt: ${channel}`, ephemeral: true });
  } catch (e) {
    console.error('Ticket Error:', e);
    return interaction.reply({ content: `❌ Fehler: ${e.message}`, ephemeral: true });
  }
}

module.exports.openTicket = openTicket;
module.exports.generateTranscript = generateTranscript;
