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

    // Fake guildData-Objekt für applyAction Kompatibilität
    const guildData = { modules: { automod, moderation: automod } };
    const member = message.member;

    // Ignorierte Channels und Rollen
    if (automod.ignoredChannels.includes(message.channel.id)) return;
    if (member && automod.ignoredRoles.some(r => member.roles.cache.has(r))) return;
    // Admins ignorieren
    if (member && member.permissions.has('Administrator')) return;

    // === ANTI-SPAM ===
    if (automod.antiSpam.enabled) {
      const key = `${message.guild.id}-${message.author.id}`;
      const now = Date.now();
      const tracker = spamTracker.get(key) || { messages: [], warned: false };
      tracker.messages = tracker.messages.filter(t => now - t < automod.antiSpam.timeWindow);
      tracker.messages.push(now);
      spamTracker.set(key, tracker);
      setTimeout(() => spamTracker.delete(key), automod.antiSpam.timeWindow * 2);

      if (tracker.messages.length >= automod.antiSpam.maxMessages) {
        message.delete().catch(() => {});
        await applyAction(message, automod.antiSpam.action, 'AutoMod: Spam erkannt', guildData);
        tracker.messages = [];
        return;
      }
    }

    // === ANTI-LINKS ===
    if (automod.antiLinks.enabled) {
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
      const links = message.content.match(urlRegex);
      if (links) {
        const isWhitelisted = automod.antiLinks.whitelist.some(w =>
          links.some(l => l.includes(w))
        );
        if (!isWhitelisted) {
          message.delete().catch(() => {});
          await applyAction(message, automod.antiLinks.action, 'AutoMod: Link erkannt', guildData);
          return;
        }
      }
    }

    // === WORT-FILTER ===
    if (automod.wordFilter.enabled && automod.wordFilter.words.length > 0) {
      const content = message.content.toLowerCase();
      const found = automod.wordFilter.words.some(w => content.includes(w.toLowerCase()));
      if (found) {
        message.delete().catch(() => {});
        await applyAction(message, automod.wordFilter.action, 'AutoMod: Verbotenes Wort', guildData);
        return;
      }
    }

    // === CAPS-FILTER ===
    if (automod.capsFilter.enabled) {
      const content = message.content;
      if (content.length >= automod.capsFilter.minLength) {
        const upperCount = (content.match(/[A-ZÃ„Ã–Ãœ]/g) || []).length;
        const totalLetters = (content.match(/[a-zA-ZÃ¤Ã¶Ã¼Ã„Ã–Ãœ]/g) || []).length;
        if (totalLetters > 0) {
          const capsPercent = (upperCount / totalLetters) * 100;
          if (capsPercent >= automod.capsFilter.threshold) {
            message.delete().catch(() => {});
            await applyAction(message, automod.capsFilter.action, 'AutoMod: Zu viele GroÃŸbuchstaben', guildData);
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

