const Guild = require('../models').Guild;
const inviteTracking = require('../modules/inviteTracking');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    console.log(`âž• Server beigetreten: ${guild.name} (${guild.id})`);
    await Guild.findOneAndUpdate(
      { guildId: guild.id },
      { guildId: guild.id, name: guild.name, icon: guild.iconURL() },
      { upsert: true, new: true }
    );
    await inviteTracking.cacheInvites(guild);
  }
};



