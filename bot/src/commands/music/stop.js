const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stoppt die Musik und leert die Warteschlange'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: '❌ Keine Musik läuft.', flags: MessageFlags.Ephemeral });
    await queue.stop();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor('#FF0000').setDescription('⏹️ Musik gestoppt und Warteschlange geleert.')] });
  }
};
