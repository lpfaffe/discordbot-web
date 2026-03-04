const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');
const Guild = require('../../../../shared/models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Stummt einen Nutzer')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addIntegerOption(o => o.setName('minuten').setDescription('Dauer in Minuten (0 = dauerhaft)'))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'mute');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getMember('nutzer');
    const minutes = interaction.options.getInteger('minuten') || 0;
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    if (!target) return interaction.reply({ content: '❌ Nutzer nicht gefunden.', ephemeral: true });

    // Discord Timeout (einfacher als Mute-Rolle)
    const duration = minutes > 0 ? minutes * 60 * 1000 : 28 * 24 * 60 * 60 * 1000;
    if (target.moderatable) {
      await target.timeout(duration, reason);
    } else {
      // Fallback: Mute-Rolle
      const guildData = await Guild.findOne({ guildId: interaction.guildId });
      const muteRoleId = guildData?.modules?.moderation?.muteRoleId;
      if (muteRoleId) await target.roles.add(muteRoleId).catch(() => {});
    }

    await interaction.reply({ content: `🔇 **${target.user.username}** wurde stumm geschaltet${minutes ? ` für ${minutes} Minuten` : ' (dauerhaft)'}.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'mute', target.user, reason, minutes ? `Dauer: ${minutes} Min` : 'Dauerhaft');
  }
};

