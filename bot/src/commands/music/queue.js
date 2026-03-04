const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Zeigt die aktuelle Musik-Warteschlange'),

  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guild.id);
    if (!queue || !queue.songs.length) {
      return interaction.reply({ content: '❌ Die Warteschlange ist leer.', ephemeral: true });
    }

    const songs = queue.songs.slice(0, 10);
    const description = songs.map((s, i) =>
      `${i === 0 ? '▶️' : `**${i}.**`} [${s.name}](${s.url}) — \`${s.formattedDuration}\``
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎵 Warteschlange')
      .setDescription(description)
      .addFields({ name: 'Songs gesamt', value: `${queue.songs.length}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};


