const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-unlock')
    .setDescription('Entsperrt deinen temporären Voice-Kanal'),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction, 'unlock')) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      Connect: null // zurücksetzen auf Standard
    });
    await interaction.reply({ content: '🔓 Kanal entsperrt.', flags: MessageFlags.Ephemeral });
  }
};

