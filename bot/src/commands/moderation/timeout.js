const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Setzt einen Timeout für einen Nutzer')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'timeout');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const minutes = interaction.options.getInteger('minuten');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    if (!target?.moderatable) return interaction.reply({ content: '❌ Ich kann diesen Nutzer nicht timeouten.', ephemeral: true });

    await target.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({ content: `⏱️ **${target.user.username}** hat einen Timeout von **${minutes} Minuten** bekommen.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'timeout', target.user, reason, `Dauer: ${minutes} Minuten`);
  }
};


