const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPerm, checkModule } = require('../../modules/commandHelper');
const { logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Rolle einem Mitglied hinzufügen oder entfernen')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addRoleOption(o => o.setName('rolle').setDescription('Rolle').setRequired(true))
    .addStringOption(o => o.setName('aktion').setDescription('Hinzufügen oder Entfernen').setRequired(true)
      .addChoices({ name: '➕ Hinzufügen', value: 'add' }, { name: '➖ Entfernen', value: 'remove' })),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.ManageRoles, 'moderation', 'role');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const role = interaction.options.getRole('rolle');
    const action = interaction.options.getString('aktion');

    if (!target) return interaction.reply({ content: '❌ Nutzer nicht gefunden.', ephemeral: true });
    if (role.managed) return interaction.reply({ content: '❌ Diese Rolle wird von einer Integration verwaltet.', ephemeral: true });
    if (role.position >= interaction.guild.members.me.roles.highest.position)
      return interaction.reply({ content: '❌ Diese Rolle ist höher als meine höchste Rolle.', ephemeral: true });

    if (action === 'add') {
      await target.roles.add(role);
      await interaction.reply({ content: `✅ Rolle **${role.name}** wurde **${target.user.username}** hinzugefügt.` });
    } else {
      await target.roles.remove(role);
      await interaction.reply({ content: `✅ Rolle **${role.name}** wurde von **${target.user.username}** entfernt.` });
    }
    await logAction(interaction, 'role', target.user, `${action === 'add' ? '➕' : '➖'} @${role.name}`);
  }
};

