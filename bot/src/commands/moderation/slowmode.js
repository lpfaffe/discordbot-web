const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Setzt den Slowmode in einem Kanal')
    .addIntegerOption(o => o.setName('sekunden').setDescription('Sekunden (0 = deaktivieren)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .addChannelOption(o => o.setName('kanal').setDescription('Kanal (leer = aktueller Kanal)')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'slowmode');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const seconds = interaction.options.getInteger('sekunden');
    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    await channel.setRateLimitPerUser(seconds);
    await interaction.reply({
      content: seconds === 0
        ? `✅ Slowmode in <#${channel.id}> deaktiviert.`
        : `🐢 Slowmode in <#${channel.id}> auf **${seconds} Sekunden** gesetzt.`
    });
    await logAction(interaction, 'slowmode', null, `Slowmode: ${seconds}s`, `Kanal: <#${channel.id}>`);
  }
};


