const { SlashCommandBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Wirft einen Würfel')
    .addIntegerOption(o => o.setName('seiten').setDescription('Anzahl Seiten (Standard: 6)').setMinValue(2).setMaxValue(1000))
    .addIntegerOption(o => o.setName('anzahl').setDescription('Anzahl Würfel (Standard: 1)').setMinValue(1).setMaxValue(10)),

  async execute(interaction) {
    const err = await checkModule(interaction, 'utility');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const sides  = interaction.options.getInteger('seiten')  || 6;
    const amount = interaction.options.getInteger('anzahl') || 1;
    const results = Array.from({ length: amount }, () => Math.floor(Math.random() * sides) + 1);
    const sum = results.reduce((a, b) => a + b, 0);

    interaction.reply({
      content: `🎲 **${amount}W${sides}**: ${results.map(r => `\`${r}\``).join(' + ')}${amount > 1 ? ` = **${sum}**` : ''}`
    });
  }
};

