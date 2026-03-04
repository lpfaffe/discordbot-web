const levelingModule = require('../modules/leveling');
const automodModule = require('../modules/automod');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // AutoMod
    await automodModule.handle(message, client);

    // Leveling
    await levelingModule.handleMessage(message, client);
  }
};

