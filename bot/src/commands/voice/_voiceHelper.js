const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const { getModuleConfig } = require('../../modules/dbHelper');
const { tempChannelMap, getOwner } = require('../../modules/tempChannels');

// Hilfsfunktion: Prüft ob User in einem temp-Kanal ist und ob er der Owner ist
async function getTempChannel(interaction) {
  const member = interaction.member;
  const voiceChannel = member?.voice?.channel;

  if (!voiceChannel) {
    await interaction.reply({ content: '❌ Du bist in keinem Voice-Kanal!', flags: MessageFlags.Ephemeral });
    return null;
  }

  const ownerId = getOwner(voiceChannel.id);
  if (!ownerId) {
    await interaction.reply({ content: '❌ Das ist kein temporärer Kanal!', flags: MessageFlags.Ephemeral });
    return null;
  }

  // Admins dürfen alles, normale User nur ihren eigenen Kanal
  const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
  if (ownerId !== member.id && !isAdmin) {
    await interaction.reply({ content: '❌ Du bist nicht der Besitzer dieses Kanals!', flags: MessageFlags.Ephemeral });
    return null;
  }

  return voiceChannel;
}

// Prüft ob Control-Channel stimmt UND ob der Command aktiviert ist
async function checkControlChannel(interaction, cmdKey) {
  const tc = await getModuleConfig(interaction.guildId, 'tempChannels');

  if (!tc?.enabled) {
    await interaction.reply({ content: '❌ Temporäre Kanäle sind deaktiviert.', flags: MessageFlags.Ephemeral });
    return false;
  }

  // Command deaktiviert?
  if (cmdKey && tc.enabledCommands?.[cmdKey] === false) {
    await interaction.reply({
      content: `❌ Dieser Command ist deaktiviert. Ein Admin kann ihn im Dashboard aktivieren.`,
      flags: MessageFlags.Ephemeral
    });
    return false;
  }

  // Wenn Control-Channel gesetzt: nur dort erlauben
  if (tc.controlChannelId && interaction.channelId !== tc.controlChannelId) {
    await interaction.reply({
      content: `❌ Dieser Command ist nur in <#${tc.controlChannelId}> erlaubt!\nNutze \`/voice-help\` für alle Commands.`,
      flags: MessageFlags.Ephemeral
    });
    return false;
  }

  return true;
}

module.exports = { getTempChannel, checkControlChannel };
