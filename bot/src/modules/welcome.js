const { EmbedBuilder } = require('discord.js');
const Guild = require('../models').Guild;

function replacePlaceholders(text, member, guild) {
  return text
    .replace(/{user}/g, `<@${member.id}>`)
    .replace(/{username}/g, member.user.username)
    .replace(/{server}/g, guild.name)
    .replace(/{count}/g, guild.memberCount)
    .replace(/{mention}/g, `<@${member.id}>`);
}

async function handleJoin(member, client) {
  try {
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    if (!guildData || !guildData.modules.welcome.enabled) return;

    const { welcome } = guildData.modules;

    // Willkommensnachricht im Channel
    if (welcome.channelId) {
      const channel = member.guild.channels.cache.get(welcome.channelId);
      if (channel) {
        if (welcome.useEmbed) {
          const embed = new EmbedBuilder()
            .setColor(welcome.embedColor || '#5865F2')
            .setTitle(welcome.embedTitle || 'Willkommen!')
            .setDescription(replacePlaceholders(welcome.embedDescription, member, member.guild))
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .setFooter({ text: `Mitglied #${member.guild.memberCount}` })
            .setTimestamp();
          channel.send({ embeds: [embed] });
        } else {
          channel.send(replacePlaceholders(welcome.message, member, member.guild));
        }
      }
    }

    // DM Willkommensnachricht
    if (welcome.dm.enabled && welcome.dm.message) {
      member.send(replacePlaceholders(welcome.dm.message, member, member.guild)).catch(() => {});
    }
  } catch (err) {
    console.error('Welcome Join Fehler:', err);
  }
}

async function handleLeave(member, client) {
  try {
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    if (!guildData || !guildData.modules.welcome.enabled) return;

    const { goodbye } = guildData.modules.welcome;
    if (!goodbye.enabled || !goodbye.channelId) return;

    const channel = member.guild.channels.cache.get(goodbye.channelId);
    if (channel) {
      const msg = goodbye.message
        .replace(/{user}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{count}/g, member.guild.memberCount);
      channel.send(msg);
    }
  } catch (err) {
    console.error('Welcome Leave Fehler:', err);
  }
}

module.exports = { handleJoin, handleLeave };

