const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stoppt die Musik und leert die Warteschlange'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Keine Musik läuft.', ephemeral: true });
    queue.stop();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('⏹️ Musik gestoppt!')] });
  }
};


