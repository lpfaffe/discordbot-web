const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannt einen Nutzer vom Server')
    .addUserOption(o => o.setName('nutzer').setDescription('Zu bannender Nutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund').setRequired(false))
    .addIntegerOption(o => o.setName('tage').setDescription('Nachrichten löschen (Tage)').setMinValue(0).setMaxValue(7)),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'ban');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    const days   = interaction.options.getInteger('tage') || 0;

    if (!target) return interaction.reply({ content: '❌ Nutzer nicht gefunden.', ephemeral: true });
    if (!target.bannable) return interaction.reply({ content: '❌ Ich kann diesen Nutzer nicht bannen.', ephemeral: true });

    await target.ban({ deleteMessageDays: days, reason });
    await interaction.reply({ content: `✅ **${target.user.username}** wurde gebannt.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'ban', target.user, reason, `Nachrichten gelöscht: ${days} Tag(e)`);
  }
};

