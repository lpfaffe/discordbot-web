const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kickt einen Nutzer vom Server')
    .addUserOption(o => o.setName('nutzer').setDescription('Zu kickender Nutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'kick');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    if (!target?.kickable) return interaction.reply({ content: '❌ Ich kann diesen Nutzer nicht kicken.', ephemeral: true });

    await target.kick(reason);
    await interaction.reply({ content: `✅ **${target.user.username}** wurde gekickt.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'kick', target.user, reason);
  }
};

