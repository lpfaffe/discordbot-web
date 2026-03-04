const welcomeModule = require('../modules/welcome');
const inviteTracking = require('../modules/inviteTracking');
const { getModuleConfig } = require('../modules/dbHelper');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    await welcomeModule.handleJoin(member, client);
    await inviteTracking.handleJoin(member);

    // AutoRole
    try {
      const welcome = await getModuleConfig(member.guild.id, 'welcome');
      if (!welcome) return;
      const autoRole = welcome.autoRole;
      if (autoRole?.enabled && autoRole?.roleId) {
        const role = member.guild.roles.cache.get(autoRole.roleId);
        if (role) await member.roles.add(role).catch(console.error);
      }
    } catch (err) {
      console.error('AutoRole Fehler:', err);
    }
  }
};

