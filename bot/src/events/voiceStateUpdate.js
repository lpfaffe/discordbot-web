const mongoose = require('mongoose');
const { tempChannelMap, removeChannel } = require('../modules/tempChannels');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    try {
      const guildId = newState.guild?.id || oldState.guild?.id;
      if (!guildId) return;

      const col = mongoose.connection.collection('guilds');
      const doc = await col.findOne({ guildId });
      const tc  = doc?.modules?.tempChannels;

      if (!tc) return;
      const enabled = (typeof tc === 'boolean') ? tc : tc?.enabled;
      if (!enabled) return;

      const triggerChannelId = tc?.triggerChannelId;
      const categoryId       = tc?.categoryId    || null;
      const channelName      = tc?.channelName   || "{user}'s Kanal";
      const userLimit        = tc?.userLimit      || 0;
      const controlChannelId = tc?.controlChannelId || null;

      if (!triggerChannelId) return;

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
          type: 2,
          parent:    categoryId || null,
          userLimit: userLimit  || 0,
          permissionOverwrites: [
            { id: member.id, allow: ['ManageChannels', 'MoveMembers', 'Connect', 'Speak'] },
            { id: newState.guild.roles.everyone, allow: ['Connect', 'Speak', 'ViewChannel'] }
          ]
        });

        await newState.setChannel(channel).catch(e =>
          console.error('[TempChannels] Verschieben fehlgeschlagen:', e.message)
        );

        tempChannelMap.set(member.id, channel.id);
        console.log(`[TempChannels] Kanal erstellt: "${name}" (${channel.id})`);

        // Willkommensnachricht im Control-Channel
        if (controlChannelId) {
          const ctrlCh = newState.guild.channels.cache.get(controlChannelId);
          if (ctrlCh) {
            const { EmbedBuilder } = require('discord.js');
            ctrlCh.send({
              embeds: [new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🔊 Dein temporärer Kanal')
                .setDescription(`**${name}** wurde erstellt.\nNutze diese Commands hier:`)
                .addFields(
                  { name: '🏷️ Umbenennen',  value: '`/voice-rename [Name]`',   inline: true },
                  { name: '👥 User-Limit',   value: '`/voice-limit [Anzahl]`',  inline: true },
                  { name: '🔒 Sperren',      value: '`/voice-lock`',            inline: true },
                  { name: '🔓 Entsperren',   value: '`/voice-unlock`',          inline: true },
                  { name: '👢 Kick',         value: '`/voice-kick [@User]`',    inline: true },
                  { name: '🚫 Ban',          value: '`/voice-ban [@User]`',     inline: true },
                  { name: '✅ Unban',        value: '`/voice-unban [@User]`',   inline: true },
                  { name: '🗑️ Schließen',   value: '`/voice-close`',           inline: true },
                )
                .setFooter({ text: `Kanal-ID: ${channel.id}` })
                .setTimestamp()
              ]
            }).catch(() => {});
          }
        }
      }

      // ── User verlässt → löschen wenn leer ──
      if (oldState.channelId && oldState.channelId !== triggerChannelId) {
        const ch = oldState.guild.channels.cache.get(oldState.channelId);
        if (ch && ch.members.size === 0) {
          const isTempChannel = [...tempChannelMap.values()].includes(ch.id);
          if (isTempChannel) {
            await ch.delete('Temp-Kanal leer').catch(() => {});
            console.log(`[TempChannels] Leerer Kanal gelöscht: "${ch.name}"`);
            removeChannel(ch.id);
          }
        }
      }
    } catch (e) {
      console.error('[TempChannels] Fehler:', e.message);
    }
  }
};
