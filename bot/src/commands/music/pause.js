const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausiert / Setzt die Musik fort'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Keine Musik läuft.', flags: MessageFlags.Ephemeral });

    if (queue.paused) {
      queue.resume();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00FF00').setDescription('▶️ Musik fortgesetzt!')] });
    } else {
      queue.pause();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#FFA500').setDescription('⏸️ Musik pausiert!')] });
    }
  }
};
