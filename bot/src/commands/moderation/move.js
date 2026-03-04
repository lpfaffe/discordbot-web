const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPerm, checkModule } = require('../../modules/commandHelper');
const { logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Verschiebt einen Nutzer in einen Sprachkanal')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addChannelOption(o => o.setName('kanal').setDescription('Ziel-Sprachkanal').setRequired(true)),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.MoveMembers, 'moderation', 'move');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const channel = interaction.options.getChannel('kanal');

    if (!target?.voice?.channel) return interaction.reply({ content: '❌ Nutzer ist in keinem Sprachkanal.', ephemeral: true });
    if (channel.type !== 2) return interaction.reply({ content: '❌ Das ist kein Sprachkanal.', ephemeral: true });

    await target.voice.setChannel(channel);
    await interaction.reply({ content: `✅ **${target.user.username}** wurde in **${channel.name}** verschoben.` });
    await logAction(interaction, 'move', target.user, `Verschoben nach: ${channel.name}`);
  }
};

