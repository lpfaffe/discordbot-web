
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getModuleConfig } = require('../../modules/dbHelper');

const ALL_COMMANDS = [
  { key: 'rename', cmd: '/voice-rename [name]',  icon: '🏷️', desc: 'Ändert den Namen deines Voice-Kanals',          cat: '⚙️ Allgemein' },
  { key: 'limit',  cmd: '/voice-limit [0-99]',   icon: '👥', desc: 'Setzt das User-Limit (0 = unbegrenzt)',          cat: '⚙️ Allgemein' },
  { key: 'lock',   cmd: '/voice-lock',            icon: '🔒', desc: 'Sperrt den Kanal – niemand kann mehr beitreten', cat: '⚙️ Allgemein' },
  { key: 'unlock', cmd: '/voice-unlock',          icon: '🔓', desc: 'Entsperrt den Kanal',                            cat: '⚙️ Allgemein' },
  { key: 'close',  cmd: '/voice-close',           icon: '🗑️', desc: 'Löscht den Kanal',                              cat: '⚙️ Allgemein' },
  { key: 'kick',   cmd: '/voice-kick [@user]',    icon: '👢', desc: 'Wirft einen Nutzer aus dem Kanal',               cat: '🛡️ Moderation' },
  { key: 'ban',    cmd: '/voice-ban [@user]',     icon: '🚫', desc: 'Verbannt einen Nutzer aus dem Kanal',            cat: '🛡️ Moderation' },
  { key: 'unban',  cmd: '/voice-unban [@user]',   icon: '✅', desc: 'Hebt den Bann eines Nutzers auf',               cat: '🛡️ Moderation' },
];

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-help')
    .setDescription('Zeigt alle verfügbaren Voice-Channel Commands'),

  async execute(interaction, client) {
    const tc = await getModuleConfig(interaction.guildId, 'tempChannels');

    if (!tc?.enabled) {
      return interaction.reply({
        content: '❌ Temporäre Kanäle sind auf diesem Server nicht aktiviert.',
        flags: MessageFlags.Ephemeral
      });
    }

    const enabledCmds = tc.enabledCommands || {};
    const controlChannelId = tc.controlChannelId;

    // Filtern: nur aktivierte Commands anzeigen
    const active = ALL_COMMANDS.filter(c => enabledCmds[c.key] !== false);
    const inactive = ALL_COMMANDS.filter(c => enabledCmds[c.key] === false);

    // Nach Kategorie gruppieren
    const groups = active.reduce((acc, c) => {
      if (!acc[c.cat]) acc[c.cat] = [];
      acc[c.cat].push(c);
      return acc;
    }, {});

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🔊 Voice-Channel Commands')
      .setDescription(
        (controlChannelId
          ? `📍 Commands nur in <#${controlChannelId}> verfügbar\n\n`
          : '📍 Commands überall verfügbar\n\n') +
        'Du musst **Besitzer** des Kanals sein um diese Commands zu nutzen.\nServer-Admins können jeden Kanal verwalten.'
      )
      .setTimestamp();

    for (const [cat, cmds] of Object.entries(groups)) {
      const value = cmds
        .map(c => `${c.icon} \`${c.cmd}\`\n└ ${c.desc}`)
        .join('\n\n');
      embed.addFields({ name: cat, value, inline: false });
    }

    if (inactive.length > 0) {
      embed.addFields({
        name: '🚫 Deaktivierte Commands',
        value: inactive.map(c => `~~\`${c.cmd}\`~~`).join(', '),
        inline: false
      });
    }

    embed.setFooter({ text: `${active.length} aktive Commands · Konfiguriert im Dashboard` });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};

