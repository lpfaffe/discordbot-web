const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-limit')
    .setDescription('Setzt das User-Limit deines temporären Voice-Kanals (0 = kein Limit)')
    .addIntegerOption(o => o
      .setName('limit')
      .setDescription('Anzahl der Nutzer (0–99, 0 = kein Limit)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(99)
    ),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction, 'limit')) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    const limit = interaction.options.getInteger('limit');
    await channel.setUserLimit(limit);
    await interaction.reply({
      content: limit === 0
        ? '✅ User-Limit entfernt (unbegrenzt).'
        : `✅ User-Limit auf **${limit}** gesetzt.`,
      flags: MessageFlags.Ephemeral
    });
  }
};

