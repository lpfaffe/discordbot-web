const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Überspringt den aktuellen Song'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Keine Musik läuft gerade.', ephemeral: true });
    try {
      await queue.skip();
      await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setDescription('⏭️ Song übersprungen!')] });
    } catch (err) {
      await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
    }
  }
};


