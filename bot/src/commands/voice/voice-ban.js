const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-ban')
    .setDescription('Verbannt einen Nutzer aus deinem temporären Voice-Kanal')
    .addUserOption(o => o
      .setName('user')
      .setDescription('Der Nutzer der gebannt werden soll')
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
      return interaction.reply({ content: '❌ Du kannst dich nicht selbst bannen.', flags: MessageFlags.Ephemeral });
    }

    // Verbiet dem User den Beitritt
    await channel.permissionOverwrites.edit(target.id, { Connect: false });

    // Wenn er gerade im Kanal ist → rauswerfen
    if (target.voice?.channelId === channel.id) {
      await target.voice.disconnect(`Voice-Ban durch ${interaction.user.username}`);
    }

    await interaction.reply({
      content: `🚫 **${target.user.username}** wurde aus dem Kanal gebannt.`,
      flags: MessageFlags.Ephemeral
    });
  }
};

