const { EmbedBuilder } = require('discord.js');
const Guild = require('../models').Guild;
const User = require('../models').User;

function getXpForLevel(level) { return 5 * (level ** 2) + 50 * level + 100; }

async function handleMessage(message, client) {
  if (!message.guild || message.author.bot) return;
  try {
    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData?.modules?.leveling?.enabled) return;

    const { xpPerMessage, xpCooldown, ignoredChannels, ignoredRoles, levelUpChannelId, levelUpMessage, levelRoles } = guildData.modules.leveling;
    if (ignoredChannels?.includes(message.channel.id)) return;
    if (message.member && ignoredRoles?.some(r => message.member.roles.cache.has(r))) return;

    let user = await User.findOneAndUpdate(
      { discordId: message.author.id },
      { $setOnInsert: { discordId: message.author.id, username: message.author.username } },
      { upsert: true, new: true }
    );

    const gid = message.guild.id;
    const currentXp    = user.xp?.get(gid)    || 0;
    const currentLevel = user.level?.get(gid)  || 0;

    // Cooldown
    const lastKey = `lastXp_${gid}`;
    const lastGain = user[lastKey] ? new Date(user[lastKey]).getTime() : 0;
    if (Date.now() - lastGain < (xpCooldown || 60) * 1000) return;

    const xpGained = Math.floor((xpPerMessage || 15) * (0.5 + Math.random() * 0.5));
    let newXp = currentXp + xpGained;
    let newLevel = currentLevel;

    // Level-Up prÃ¼fen
    while (newXp >= getXpForLevel(newLevel)) {
      newXp -= getXpForLevel(newLevel);
      newLevel++;

      // Level-Up Nachricht
      const ch = levelUpChannelId
        ? message.guild.channels.cache.get(levelUpChannelId)
        : message.channel;
      if (ch) {
        const msg = (levelUpMessage || 'GlÃ¼ckwunsch {user}! Du bist auf Level {level} aufgestiegen!')
          .replace('{user}', `<@${message.author.id}>`)
          .replace('{level}', newLevel);
        ch.send(msg).catch(console.error);
      }

      // Level-Rollen
      if (levelRoles?.length) {
        const due = levelRoles.filter(lr => lr.level === newLevel);
        for (const lr of due) {
          const role = message.guild.roles.cache.get(lr.roleId);
          if (role) message.member.roles.add(role).catch(console.error);
        }
      }
    }

    await User.updateOne(
      { discordId: message.author.id },
      { $set: { [`xp.${gid}`]: newXp, [`level.${gid}`]: newLevel } }
    );
  } catch (e) { console.error('Leveling Fehler:', e); }
}

module.exports = { handleMessage };
