const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');
const { getModuleConfig } = require('../modules/dbHelper');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── TICKET BUTTONS ──────────────────────────────────────────
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
      const id = interaction.customId;

      if (id.startsWith('ticket_create_')) {
        const typId = id.replace('ticket_create_', '');
        const tickets = await getModuleConfig(interaction.guildId, 'tickets');
        if (!tickets?.enabled) return interaction.reply({ content: '❌ Ticket-Modul deaktiviert.', flags: MessageFlags.Ephemeral });
        const modal = new ModalBuilder().setCustomId(`ticket_modal_${typId}`).setTitle('Ticket erstellen');
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('grund').setLabel('Beschreibe dein Anliegen').setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(10).setMaxLength(500).setPlaceholder('Beschreibe dein Problem oder deine Anfrage...')
        ));
        return interaction.showModal(modal);
      }

      if (id === 'ticket_create_select') {
        const typId = interaction.values[0];
        const tickets = await getModuleConfig(interaction.guildId, 'tickets');
        if (!tickets?.enabled) return interaction.reply({ content: '❌ Ticket-Modul deaktiviert.', flags: MessageFlags.Ephemeral });
        const modal = new ModalBuilder().setCustomId(`ticket_modal_${typId}`).setTitle('Ticket erstellen');
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('grund').setLabel('Beschreibe dein Anliegen').setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(10).setMaxLength(500)
        ));
        return interaction.showModal(modal);
      }

      if (id === 'ticket_close_btn') {
        if (!interaction.channel.name.startsWith('ticket-') && !interaction.channel.topic?.includes('ticket-owner:'))
          return interaction.reply({ content: '❌ Kein Ticket-Kanal.', flags: MessageFlags.Ephemeral });
        const tickets = await getModuleConfig(interaction.guildId, 'tickets');
        const { generateTranscript } = require('../commands/utility/ticket');
        await interaction.deferReply();
        const text = await generateTranscript(interaction.channel);
        const buf = Buffer.from(text, 'utf-8');
        if (tickets?.logChannelId) {
          const logCh = interaction.guild.channels.cache.get(tickets.logChannelId);
          const ownerMatch = (interaction.channel.topic || '').match(/ticket-owner:(\d+)/);
          logCh?.send({ embeds: [new EmbedBuilder().setColor('#FF0000').setTitle('🔒 Ticket geschlossen')
            .addFields(
              { name: 'Kanal', value: interaction.channel.name, inline: true },
              { name: 'Geschlossen von', value: interaction.user.username, inline: true },
              { name: 'Ersteller', value: ownerMatch ? `<@${ownerMatch[1]}>` : '?', inline: true }
            ).setTimestamp()
          ], files: [{ attachment: buf, name: `transcript-${interaction.channel.name}.txt` }] });
        }
        if (tickets?.ratingEnabled) {
          const ownerMatch = (interaction.channel.topic || '').match(/ticket-owner:(\d+)/);
          const owner = ownerMatch ? await interaction.guild.members.fetch(ownerMatch[1]).catch(() => null) : null;
          if (owner) {
            const row = new ActionRowBuilder().addComponents(
              ...[1,2,3,4,5].map(n => new ButtonBuilder().setCustomId(`ticket_rate_${n}`).setLabel('⭐'.repeat(n)).setStyle(ButtonStyle.Secondary))
            );
            owner.send({ content: `Wie war dein Support-Erlebnis in **${interaction.channel.name}**?`, components: [row] }).catch(() => {});
          }
        }
        await interaction.editReply({ content: '🔒 Ticket wird in 5 Sekunden geschlossen...' });
        setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
        return;
      }

      if (id === 'ticket_claim_btn') {
        await interaction.channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true, SendMessages: true });
        await interaction.channel.setTopic((interaction.channel.topic || '') + ` | claimed:${interaction.user.id}`);
        await interaction.channel.send({ embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`✅ **${interaction.user.username}** hat dieses Ticket beansprucht.`).setTimestamp()] });
        return interaction.reply({ content: '✅ Ticket beansprucht!', flags: MessageFlags.Ephemeral });
      }

      if (id === 'ticket_hold_btn') {
        const ownerMatch = (interaction.channel.topic || '').match(/ticket-owner:(\d+)/);
        if (ownerMatch) await interaction.channel.permissionOverwrites.edit(ownerMatch[1], { SendMessages: false });
        await interaction.channel.send({ embeds: [new EmbedBuilder().setColor('#FFA500').setDescription('⏳ **Ticket auf Wartestellung gesetzt.**\nDer Support wartet auf weitere Informationen von dir.').setTimestamp()] });
        return interaction.reply({ content: '✅ Wartestellung gesetzt.', flags: MessageFlags.Ephemeral });
      }

      if (id === 'ticket_transcript_btn') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const { generateTranscript } = require('../commands/utility/ticket');
        const text = await generateTranscript(interaction.channel);
        const buf = Buffer.from(text, 'utf-8');
        return interaction.editReply({ content: '✅ Transcript:', files: [{ attachment: buf, name: `transcript-${interaction.channel.name}.txt` }] });
      }

      if (id.startsWith('ticket_rate_')) {
        const stars = parseInt(id.replace('ticket_rate_', ''));
        await interaction.reply({ content: `✅ Danke für deine Bewertung: ${'⭐'.repeat(stars)}`, flags: MessageFlags.Ephemeral });
        return;
      }
    }

    // ── MODAL: Ticket Grund ──────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
      const typId = interaction.customId.replace('ticket_modal_', '');
      const grund = interaction.fields.getTextInputValue('grund');
      const tickets = await getModuleConfig(interaction.guildId, 'tickets');
      if (!tickets?.enabled) return interaction.reply({ content: '❌ Ticket-Modul deaktiviert.', flags: MessageFlags.Ephemeral });
      const { openTicket } = require('../commands/utility/ticket');
      return openTicket(interaction, tickets, typId, grund);
    }

    // ── SLASH COMMANDS ───────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Cooldown-System
    if (!client.cooldowns.has(command.data.name)) client.cooldowns.set(command.data.name, new Map());
    const timestamps = client.cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(interaction.user.id)) {
      const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
      if (Date.now() < expiration) {
        const timeLeft = ((expiration - Date.now()) / 1000).toFixed(1);
        return interaction.reply({
          embeds: [new EmbedBuilder().setColor('#FF0000').setDescription(`⏱️ Bitte warte noch **${timeLeft}s**.`)],
          flags: MessageFlags.Ephemeral
        });
      }
    }
    timestamps.set(interaction.user.id, Date.now());
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Fehler bei Command ${interaction.commandName}:`, error);
      const errEmbed = new EmbedBuilder().setColor('#FF0000').setDescription('❌ Es ist ein Fehler aufgetreten!');
      if (interaction.replied || interaction.deferred) await interaction.followUp({ embeds: [errEmbed], flags: MessageFlags.Ephemeral });
      else await interaction.reply({ embeds: [errEmbed], flags: MessageFlags.Ephemeral });
    }
  }
};
