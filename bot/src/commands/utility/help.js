const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Zeigt alle verfügbaren Commands'),

  async execute(interaction, client) {
    const categories = {};
    client.commands.forEach(cmd => {
      const cat = cmd.category || 'Sonstige';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`\`/${cmd.data.name}\` — ${cmd.data.description}`);
    });

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📖 Hilfe — Alle Commands')
      .setDescription('Verwalte deinen Bot unter: **http://localhost:3001**')
      .setThumbnail(client.user.displayAvatarURL());

    const catLabels = {
      moderation: '🛡️ Moderation',
      leveling: '⭐ Leveling',
      music: '🎵 Musik',
      utility: '🔧 Utility'
    };

    for (const [cat, cmds] of Object.entries(categories)) {
      embed.addFields({ name: catLabels[cat] || cat, value: cmds.join('\n') });
    }

    embed.setTimestamp().setFooter({ text: `${client.commands.size} Commands` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};


