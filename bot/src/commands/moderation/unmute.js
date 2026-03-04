const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Hebt die Stummschaltung eines Nutzers auf')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'unmute');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    if (!target) return interaction.reply({ content: '❌ Nutzer nicht gefunden.', ephemeral: true });

    if (target.isCommunicationDisabled()) await target.timeout(null, reason);

    await interaction.reply({ content: `🔊 **${target.user.username}** ist nicht mehr stumm.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'unmute', target.user, reason);
  }
};

