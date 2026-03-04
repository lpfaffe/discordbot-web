const Guild = require('../models').Guild;
const { EmbedBuilder } = require('discord.js');

/**
 * PrÃ¼ft ob ein Mitglied einen Moderationsbefehl ausfÃ¼hren darf.
 * BerÃ¼cksichtigt allowedRoleId aus der DB-Konfiguration.
 * @returns {string|null} Fehlermeldung oder null wenn erlaubt
 */
async function checkPermission(interaction, commandId) {
  const guildData = await Guild.findOne({ guildId: interaction.guildId });
  const mod = guildData?.modules?.moderation;

  if (!mod?.enabled) return 'âŒ Moderation-Modul ist deaktiviert.';

  const cmdCfg = mod.commands?.[commandId];
  if (cmdCfg && cmdCfg.enabled === false) return `âŒ Der Befehl \`/${commandId}\` ist auf diesem Server deaktiviert.`;

  // Erlaubte Rolle gesetzt â†’ prÃ¼fen
  if (cmdCfg?.allowedRoleId) {
    if (!interaction.member.roles.cache.has(cmdCfg.allowedRoleId)) {
      const role = interaction.guild.roles.cache.get(cmdCfg.allowedRoleId);
      return `âŒ Du benÃ¶tigst die Rolle **${role?.name || cmdCfg.allowedRoleId}** fÃ¼r diesen Befehl.`;
    }
  }

  return null; // OK
}

/**
 * Loggt eine Moderation-Aktion in den konfigurierten Log-Kanal.
 */
async function logAction(interaction, commandId, target, reason, extra = '') {
  const guildData = await Guild.findOne({ guildId: interaction.guildId });
  const mod = guildData?.modules?.moderation;
  if (!mod) return;

  const cmdCfg = mod.commands?.[commandId];
  // Befehlsspezifischer Log hat Vorrang, dann globaler Log
  const logChannelId = cmdCfg?.logChannelId || mod.logChannelId;
  if (!logChannelId) return;

  const channel = interaction.guild.channels.cache.get(logChannelId);
  if (!channel) return;

  const actionColors = {
    ban: 0xFF0000, kick: 0xFF6600, mute: 0xFFA500, unmute: 0x00FF00,
    warn: 0xFFFF00, clearwarnings: 0x00FF00, purge: 0x5865F2,
    timeout: 0xFF4500, slowmode: 0x5865F2, lock: 0xFF0000, unlock: 0x00FF00
  };

  const embed = new EmbedBuilder()
    .setColor(actionColors[commandId] || 0x5865F2)
    .setTitle(`ðŸ›¡ï¸ ${commandId.charAt(0).toUpperCase() + commandId.slice(1)}`)
    .addFields(
      { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Ziel', value: target ? `<@${target.id}> (${target.tag || target.username})` : 'â€”', inline: true },
      { name: 'Grund', value: reason || 'Kein Grund angegeben', inline: false }
    )
    .setTimestamp();

  if (extra) embed.addFields({ name: 'Details', value: extra });
  channel.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { checkPermission, logAction };

