const { EmbedBuilder } = require('discord.js');
const { getModuleConfig } = require('./dbHelper');
const Warning = require('../models').Warning;

// Anti-Spam Tracking
const spamTracker = new Map();

async function applyAction(message, action, reason, guildData) {
  const member = message.member;
  if (!member) return;

  try {
    switch (action) {
      case 'warn':
        await Warning.create({
          guildId: message.guild.id,
          userId: message.author.id,
          moderatorId: message.client.user.id,
          reason,
          type: 'warn'
        });
        message.channel.send({
          embeds: [new EmbedBuilder().setColor('#FFA500')
            .setDescription(`âš ï¸ ${message.author} wurde verwarnt: **${reason}**`)]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        break;
      case 'mute':
        await member.timeout(10 * 60 * 1000, reason);
        break;
      case 'kick':
        await member.kick(reason);
        break;
      case 'ban':
        await member.ban({ reason });
        break;
    }

    // Log wenn Mod-Channel konfiguriert
    if (guildData.modules.moderation.logChannelId) {
      const logChannel = message.guild.channels.cache.get(guildData.modules.moderation.logChannelId);
      if (logChannel) {
        logChannel.send({
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('ðŸ›¡ï¸ AutoMod Aktion')
            .addFields(
              { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
              { name: 'Aktion', value: action, inline: true },
              { name: 'Grund', value: reason }
            )
            .setTimestamp()]
        });
      }
    }
  } catch (err) {
    console.error('AutoMod Aktion Fehler:', err);
  }
}

async function handle(message, client) {
  if (!message.guild || message.author.bot) return;

  try {
    const automod = await getModuleConfig(message.guild.id, 'automod');
    if (!automod?.enabled) return;

    // Null-safe Defaults
    const ignoredChannels = automod.ignoredChannels || [];
    const ignoredRoles    = automod.ignoredRoles    || [];
    const antiSpam   = automod.antiSpam   || {};
    const antiLinks  = automod.antiLinks  || {};
    const wordFilter = automod.wordFilter || {};
    const capsFilter = automod.capsFilter || {};

    const guildData = { modules: { automod, moderation: automod } };
    const member = message.member;

    if (ignoredChannels.includes(message.channel.id)) return;
    if (member && ignoredRoles.some(r => member.roles.cache.has(r))) return;
    if (member && member.permissions.has('Administrator')) return;

    // === ANTI-SPAM ===
    if (antiSpam.enabled) {
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      const timeWindow = antiSpam.timeWindow || 5000;
      const tracker = spamTracker.get(key) || { messages: [], warned: false };
      tracker.messages = tracker.messages.filter(t => now - t < timeWindow);
      tracker.messages.push(now);
      spamTracker.set(key, tracker);
      setTimeout(() => spamTracker.delete(key), timeWindow * 2);
      if (tracker.messages.length >= (antiSpam.maxMessages || 5)) {
        message.delete().catch(() => {});
        await applyAction(message, antiSpam.action || 'warn', 'AutoMod: Spam erkannt', guildData);
        tracker.messages = [];
        return;
      }
    }

    // === ANTI-LINKS ===
    if (antiLinks.enabled) {
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
      const links = message.content.match(urlRegex);
      if (links) {
        const whitelist = antiLinks.whitelist || [];
        const isWhitelisted = whitelist.some(w => links.some(l => l.includes(w)));
        if (!isWhitelisted) {
          message.delete().catch(() => {});
          await applyAction(message, antiLinks.action || 'warn', 'AutoMod: Link erkannt', guildData);
          return;
        }
      }
    }

    // === WORT-FILTER ===
    if (wordFilter.enabled && (wordFilter.words || []).length > 0) {
      const content = message.content.toLowerCase();
      const found = wordFilter.words.some(w => content.includes(w.toLowerCase()));
      if (found) {
        message.delete().catch(() => {});
        await applyAction(message, wordFilter.action || 'warn', 'AutoMod: Verbotenes Wort', guildData);
        return;
      }
    }

    // === CAPS-FILTER ===
    if (capsFilter.enabled) {
      const content = message.content;
      const minLength = capsFilter.minLength || 10;
      if (content.length >= minLength) {
        const upperCount = (content.match(/[A-ZÄÖÜ]/g) || []).length;
        const totalLetters = (content.match(/[a-zA-ZäöüÄÖÜ]/g) || []).length;
        if (totalLetters > 0) {
          const capsPercent = (upperCount / totalLetters) * 100;
          if (capsPercent >= (capsFilter.threshold || 70)) {
            message.delete().catch(() => {});
            await applyAction(message, capsFilter.action || 'warn', 'AutoMod: Zu viele Großbuchstaben', guildData);
            return;
          }
        }
      }
    }
  } catch (err) {
    console.error('AutoMod Fehler:', err);
  }
}

module.exports = { handle };

