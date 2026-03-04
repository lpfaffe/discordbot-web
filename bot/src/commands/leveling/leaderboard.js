const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../../shared/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Zeigt die Top-User des Servers'),

  async execute(interaction) {
    await interaction.deferReply();

    const allUsers = await User.find({ 'xpData.guildId': interaction.guild.id });
    const sorted = allUsers
      .map(u => ({
        id: u.discordId,
        username: u.username,
        data: u.xpData.find(d => d.guildId === interaction.guild.id)
      }))
      .filter(u => u.data)
      .sort((a, b) => b.data.level - a.data.level || b.data.xp - a.data.xp)
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.editReply('❌ Noch keine Daten vorhanden.');
    }

    const medals = ['🥇', '🥈', '🥉'];
    const description = sorted.map((u, i) =>
      `${medals[i] || `**#${i + 1}**`} <@${u.id}> — Level **${u.data.level}** (${u.data.xp} XP) • ${u.data.totalMessages} Nachrichten`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏆 Rangliste — ${interaction.guild.name}`)
      .setDescription(description)
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};


