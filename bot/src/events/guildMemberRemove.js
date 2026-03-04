const welcomeModule = require('../modules/welcome');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    await welcomeModule.handleLeave(member, client);
  }
};

