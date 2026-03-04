const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ändert die Lautstärke')
    .addIntegerOption(o => o.setName('lautstärke').setDescription('0-100').setRequired(true).setMinValue(0).setMaxValue(100)),

  async execute(interaction, client) {
    const volume = interaction.options.getInteger('lautstärke');
    const queue = client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Keine Musik läuft.', ephemeral: true });

    queue.setVolume(volume);
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#5865F2').setDescription(`🔊 Lautstärke auf **${volume}%** gesetzt.`)] });
  }
};


