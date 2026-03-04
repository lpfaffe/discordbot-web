const welcomeModule = require('../modules/welcome');
const inviteTracking = require('../modules/inviteTracking');
const Guild = require('../../../shared/models/Guild');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    await welcomeModule.handleJoin(member, client);
    await inviteTracking.handleJoin(member);

    // AutoRole

    try {
      const guildData = await Guild.findOne({ guildId: member.guild.id });
      if (!guildData) return;
      const { autoRole } = guildData.modules.welcome;
      if (autoRole.enabled && autoRole.roleId) {
        const role = member.guild.roles.cache.get(autoRole.roleId);
        if (role) await member.roles.add(role);
      }
    } catch (err) {
      console.error('AutoRole Fehler:', err);
    }
  }
};

