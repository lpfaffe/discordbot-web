const Guild = require('../models').Guild;

/**
 * PrÃ¼ft ob ein Modul aktiv ist.
 * @returns {string|null} Fehlermeldung oder null
 */
async function checkModule(interaction, moduleName) {
  const guildData = await Guild.findOne({ guildId: interaction.guildId });
  if (!guildData?.modules?.[moduleName]?.enabled)
    return `âŒ Dieses Modul (**${moduleName}**) ist auf diesem Server deaktiviert. Aktiviere es im Dashboard unter \`localhost:3001\`.`;
  return null;
}

/**
 * PrÃ¼ft Discord-Permission ODER erlaubte Rolle aus DB.
 * @returns {string|null} Fehlermeldung oder null
 */
async function checkPerm(interaction, permission, moduleName, cmdId) {
  const guildData = await Guild.findOne({ guildId: interaction.guildId });
  const cmdCfg = guildData?.modules?.[moduleName]?.commands?.[cmdId];

  // Befehl deaktiviert?
  if (cmdCfg && cmdCfg.enabled === false)
    return `âŒ Der Befehl \`/${cmdId}\` ist auf diesem Server deaktiviert.`;

  // Erlaubte Rolle gesetzt â†’ nur diese Rolle darf
  if (cmdCfg?.allowedRoleId) {
    if (!interaction.member.roles.cache.has(cmdCfg.allowedRoleId)) {
      const role = interaction.guild.roles.cache.get(cmdCfg.allowedRoleId);
      return `âŒ Du benÃ¶tigst die Rolle **${role?.name || 'Unbekannt'}** fÃ¼r diesen Befehl.`;
    }
    return null;
  }

  // Sonst Discord-Permission prÃ¼fen
  if (permission && !interaction.member.permissions.has(permission))
    return `âŒ Du hast keine Berechtigung fÃ¼r diesen Befehl. (BenÃ¶tigt: \`${permission}\`)`;

  return null;
}

module.exports = { checkModule, checkPerm };

