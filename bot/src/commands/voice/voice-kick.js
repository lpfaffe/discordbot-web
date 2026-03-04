const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-kick')
    .setDescription('Kickt einen Nutzer aus deinem temporären Voice-Kanal')
    .addUserOption(o => o
      .setName('user')
      .setDescription('Der Nutzer der gekickt werden soll')
      .setRequired(true)
    ),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction)) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    const target = interaction.options.getMember('user');
    if (!target) {
      return interaction.reply({ content: '❌ Nutzer nicht gefunden.', flags: MessageFlags.Ephemeral });
    }
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Du kannst dich nicht selbst kicken.', flags: MessageFlags.Ephemeral });
    }
    if (target.voice?.channelId !== channel.id) {
      return interaction.reply({ content: `❌ **${target.user.username}** ist nicht in deinem Kanal.`, flags: MessageFlags.Ephemeral });
    }

    await target.voice.disconnect(`Voice-Kick durch ${interaction.user.username}`);
    await interaction.reply({
      content: `👢 **${target.user.username}** wurde aus dem Kanal gekickt.`,
      flags: MessageFlags.Ephemeral
    });
  }
};

