const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPerm, checkModule } = require('../../modules/commandHelper');
const { logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcolor')
    .setDescription('Ändert die Farbe einer Rolle')
    .addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true))
    .addStringOption(o => o.setName('farbe').setDescription('Hex-Farbe z.B. #FF0000').setRequired(true)),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.ManageRoles, 'moderation', 'setcolor');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const role = interaction.options.getRole('rolle');
    const color = interaction.options.getString('farbe').trim();

    if (!/^#[0-9A-Fa-f]{6}$/.test(color))
      return interaction.reply({ content: '❌ Ungültige Farbe! Bitte im Format `#RRGGBB` eingeben.', ephemeral: true });

    await role.setColor(color);
    await interaction.reply({ content: `✅ Farbe der Rolle **${role.name}** wurde auf \`${color}\` gesetzt.` });
    await logAction(interaction, 'setcolor', null, `@${role.name} → ${color}`);
  }
};

