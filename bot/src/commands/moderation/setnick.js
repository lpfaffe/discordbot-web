const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPerm, checkModule } = require('../../modules/commandHelper');
const { logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('Ändert den Spitznamen eines Nutzers')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addStringOption(o => o.setName('nick').setDescription('Neuer Nickname (leer = zurücksetzen)')),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.ManageNicknames, 'moderation', 'setnick');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const nick = interaction.options.getString('nick') || null;
    if (!target) return interaction.reply({ content: '❌ Nutzer nicht gefunden.', ephemeral: true });
    if (!target.manageable) return interaction.reply({ content: '❌ Ich kann den Nickname dieses Nutzers nicht ändern.', ephemeral: true });

    await target.setNickname(nick, `Geändert von ${interaction.user.username}`);
    await interaction.reply({ content: `✅ Nickname von **${target.user.username}** wurde ${nick ? `auf **${nick}**` : 'zurückgesetzt'}.` });
    await logAction(interaction, 'setnick', target.user, `Nickname: ${nick || 'zurückgesetzt'}`);
  }
};

