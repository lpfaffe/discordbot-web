const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-lock')
    .setDescription('Sperrt deinen temporären Voice-Kanal – niemand kann mehr beitreten'),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction, 'lock')) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      Connect: false
    });
    await interaction.reply({ content: '🔒 Kanal gesperrt.', flags: MessageFlags.Ephemeral });
  }
};

