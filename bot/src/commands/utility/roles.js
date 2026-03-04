const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Zeigt alle Rollen des Servers mit Mitgliederanzahl'),

  async execute(interaction) {
    const err = await checkModule(interaction, 'utility');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    await interaction.guild.members.fetch();
    const roles = interaction.guild.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `${r} — **${r.members.size}** Mitglieder`);

    const chunks = [];
    while (roles.length) chunks.push(roles.splice(0, 20));

    for (let i = 0; i < chunks.length; i++) {
      const embed = new EmbedBuilder()
        .setTitle(i === 0 ? `🎭 Rollen auf ${interaction.guild.name}` : `🎭 Rollen (${i + 1})`)
        .setDescription(chunks[i].join('\n'))
        .setColor('#5865F2');
      if (i === 0) await interaction.reply({ embeds: [embed] });
      else await interaction.followUp({ embeds: [embed] });
    }
  }
};

