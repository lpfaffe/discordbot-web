const Guild = require('../../../shared/models/Guild');
const tempChannelMap = new Map(); // userId -> channelId

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    try {
      const guildData = await Guild.findOne({ guildId: newState.guild.id });
      const tc = guildData?.modules?.tempChannels;
      if (!tc?.enabled || !tc.triggerChannelId) return;

      // User tritt Trigger-Kanal bei → neuen Kanal erstellen
      if (newState.channelId === tc.triggerChannelId) {
        const name = (tc.channelName || "{user}'s Kanal").replace('{user}', newState.member.user.username);
        const channel = await newState.guild.channels.create({
          name,
          type: 2,
          parent: tc.categoryId || null,
          userLimit: tc.userLimit || 0,
          permissionOverwrites: [{ id: newState.member.id, allow: ['ManageChannels', 'MoveMembers'] }]
        });
        await newState.setChannel(channel);
        tempChannelMap.set(newState.member.id, channel.id);
      }

      // User verlässt einen temp-Kanal → löschen wenn leer
      if (oldState.channelId && oldState.channelId !== tc.triggerChannelId) {
        const ch = oldState.guild.channels.cache.get(oldState.channelId);
        if (ch && ch.members.size === 0 && [...tempChannelMap.values()].includes(ch.id)) {
          await ch.delete().catch(() => {});
          for (const [uid, cid] of tempChannelMap) {
            if (cid === ch.id) tempChannelMap.delete(uid);
          }
        }
      }
    } catch (e) { console.error('TempChannel Fehler:', e); }
  }
};

