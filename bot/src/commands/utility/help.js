const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const CAT_LABELS = {
  moderation: '🛡️ Moderation',
  leveling:   '⭐ Leveling',
  economy:    '💰 Wirtschaft',
  music:      '🎵 Musik',
  giveaways:  '🎉 Gewinnspiele',
  utility:    '🔧 Utility',
  sonstige:   '📦 Sonstige',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Zeigt alle verfügbaren Commands'),

  async execute(interaction, client) {
    const FRONTEND = process.env.FRONTEND_URL || 'https://rls-nds.eu';

    // Commands nach Kategorie gruppieren
    const categories = {};
    client.commands.forEach(cmd => {
      const cat = (cmd.category || 'sonstige').toLowerCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`\`/${cmd.data.name}\``);
    });

    const mainEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📖 Alle Commands')
      .setDescription(`Dashboard: **${FRONTEND}**\nInsgesamt **${client.commands.size}** Commands`)
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    // Felder aufteilen: max 1024 Zeichen pro Field
    for (const [cat, cmds] of Object.entries(categories)) {
      const label = CAT_LABELS[cat] || cat;
      // In Chunks à 20 Commands aufteilen damit 1024-Limit nicht überschritten wird
      const chunks = [];
      let chunk = [];
      let len = 0;
      for (const c of cmds) {
        if (len + c.length + 2 > 1000) { chunks.push(chunk); chunk = []; len = 0; }
        chunk.push(c); len += c.length + 2;
      }
      if (chunk.length) chunks.push(chunk);

      chunks.forEach((ch, i) => {
        mainEmbed.addFields({
          name: i === 0 ? label : `${label} (${i + 1})`,
          value: ch.join(', '),
          inline: false
        });
      });
    }

    await interaction.reply({
      embeds: [mainEmbed],
      flags: MessageFlags.Ephemeral
    });
  }
};
