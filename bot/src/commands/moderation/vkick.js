const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPerm, checkModule } = require('../../modules/commandHelper');
const { logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vkick')
    .setDescription('Kickt einen Nutzer aus dem Sprachkanal')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.MoveMembers, 'moderation', 'vkick');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    if (!target?.voice?.channel) return interaction.reply({ content: '❌ Dieser Nutzer ist in keinem Sprachkanal.', ephemeral: true });

    await target.voice.disconnect(reason);
    await interaction.reply({ content: `✅ **${target.user.username}** wurde aus dem Sprachkanal geworfen.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'vkick', target.user, reason, `Kanal: ${target.voice.channel?.name || '?'}`);
  }
};

