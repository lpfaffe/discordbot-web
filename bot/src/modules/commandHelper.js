const Guild = require('../../../shared/models/Guild');

/**
 * Prüft ob ein Modul aktiv ist.
 * @returns {string|null} Fehlermeldung oder null
 */
async function checkModule(interaction, moduleName) {
  const guildData = await Guild.findOne({ guildId: interaction.guildId });
  if (!guildData?.modules?.[moduleName]?.enabled)
    return `❌ Dieses Modul (**${moduleName}**) ist auf diesem Server deaktiviert. Aktiviere es im Dashboard unter \`localhost:3001\`.`;
  return null;
}

/**
 * Prüft Discord-Permission ODER erlaubte Rolle aus DB.
 * @returns {string|null} Fehlermeldung oder null
 */
async function checkPerm(interaction, permission, moduleName, cmdId) {
  const guildData = await Guild.findOne({ guildId: interaction.guildId });
  const cmdCfg = guildData?.modules?.[moduleName]?.commands?.[cmdId];

  // Befehl deaktiviert?
  if (cmdCfg && cmdCfg.enabled === false)
    return `❌ Der Befehl \`/${cmdId}\` ist auf diesem Server deaktiviert.`;

  // Erlaubte Rolle gesetzt → nur diese Rolle darf
  if (cmdCfg?.allowedRoleId) {
    if (!interaction.member.roles.cache.has(cmdCfg.allowedRoleId)) {
      const role = interaction.guild.roles.cache.get(cmdCfg.allowedRoleId);
      return `❌ Du benötigst die Rolle **${role?.name || 'Unbekannt'}** für diesen Befehl.`;
    }
    return null;
  }

  // Sonst Discord-Permission prüfen
  if (permission && !interaction.member.permissions.has(permission))
    return `❌ Du hast keine Berechtigung für diesen Befehl. (Benötigt: \`${permission}\`)`;

  return null;
}

module.exports = { checkModule, checkPerm };

