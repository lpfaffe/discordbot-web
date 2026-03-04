const { SlashCommandBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('short')
    .setDescription('Kürzt eine URL')
    .addStringOption(o => o.setName('url').setDescription('URL zum Kürzen').setRequired(true)),

  async execute(interaction) {
    const err = await checkModule(interaction, 'utility');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const url = interaction.options.getString('url');
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return interaction.reply({ content: '❌ Ungültige URL. Muss mit http:// oder https:// beginnen.', ephemeral: true });

    await interaction.deferReply();
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const short = await res.text();
      interaction.editReply({ content: `🔗 Originale URL: <${url}>\n✂️ Gekürzte URL: **${short}**` });
    } catch {
      interaction.editReply({ content: '❌ Fehler beim Kürzen der URL.' });
    }
  }
};

