const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPerm, checkModule } = require('../../modules/commandHelper');
const { logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Entbannt einen Nutzer')
    .addStringOption(o => o.setName('user_id').setDescription('User-ID').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.BanMembers, 'moderation', 'unban');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    try {
      const ban = await interaction.guild.bans.fetch(userId);
      await interaction.guild.members.unban(userId, reason);
      await interaction.reply({ content: `✅ **${ban.user.username}** wurde entbannt.\n📝 Grund: ${reason}` });
      await logAction(interaction, 'unban', ban.user, reason);
    } catch {
      interaction.reply({ content: '❌ Nutzer nicht in der Banliste gefunden.', ephemeral: true });
    }
  }
};

