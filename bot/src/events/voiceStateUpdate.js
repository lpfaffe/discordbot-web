const mongoose = require('mongoose');

// Persistente Map: userId → channelId (für Temp-Kanäle)
const tempChannelMap = new Map();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    try {
      const guildId = newState.guild?.id || oldState.guild?.id;
      if (!guildId) return;

      // Natives MongoDB lesen – umgeht Mongoose-Schema-Probleme mit Mixed-Types
      const col = mongoose.connection.collection('guilds');
      const doc = await col.findOne({ guildId });
      const tc  = doc?.modules?.tempChannels;

      // Modul aktiv prüfen
      if (!tc) return;
      // Unterstütze altes Boolean-Format UND neues Objekt-Format
      const enabled = (typeof tc === 'boolean') ? tc : tc?.enabled;
      if (!enabled) return;

      const triggerChannelId = tc?.triggerChannelId;
      const categoryId       = tc?.categoryId       || null;
      const channelName      = tc?.channelName      || "{user}'s Kanal";
      const userLimit        = tc?.userLimit        || 0;

      if (!triggerChannelId) {
        console.log(`[TempChannels] ${guildId}: Kein Trigger-Kanal konfiguriert`);
        return;
      }

      // ── User betritt Trigger-Kanal → neuen Kanal erstellen ──
      if (newState.channelId === triggerChannelId) {
        const member   = newState.member;
        const username = member?.user?.username || 'User';
        const count    = tempChannelMap.size + 1;
        const name     = channelName
          .replace('{user}',  username)
          .replace('{count}', String(count));

        console.log(`[TempChannels] ${username} betritt Trigger → erstelle Kanal "${name}"`);

        const channel = await newState.guild.channels.create({
          name,
          type: 2, // GuildVoice
          parent:    categoryId || null,
          userLimit: userLimit  || 0,
          permissionOverwrites: [
            {
              id:    member.id,
              allow: ['ManageChannels', 'MoveMembers', 'Connect', 'Speak']
            },
            {
              id:    newState.guild.roles.everyone,
              allow: ['Connect', 'Speak', 'ViewChannel']
            }
          ]
        });

        // Member in neuen Kanal verschieben
        await newState.setChannel(channel).catch(e => {
          console.error('[TempChannels] Verschieben fehlgeschlagen:', e.message);
        });

        tempChannelMap.set(member.id, channel.id);
        console.log(`[TempChannels] Kanal erstellt: "${name}" (${channel.id})`);
      }

      // ── User verlässt einen Kanal → löschen wenn leer ──
      if (oldState.channelId && oldState.channelId !== triggerChannelId) {
        const ch = oldState.guild.channels.cache.get(oldState.channelId);
        if (ch && ch.members.size === 0) {
          // Prüfen ob es ein temp-Kanal ist
          const isTempChannel = [...tempChannelMap.values()].includes(ch.id);
          if (isTempChannel) {
            await ch.delete('Temp-Kanal leer').catch(() => {});
            console.log(`[TempChannels] Leerer Kanal gelöscht: "${ch.name}"`);
            for (const [uid, cid] of tempChannelMap) {
              if (cid === ch.id) tempChannelMap.delete(uid);
            }
          }
        }
      }
    } catch (e) {
      console.error('[TempChannels] Fehler:', e.message);
    }
  }
};
