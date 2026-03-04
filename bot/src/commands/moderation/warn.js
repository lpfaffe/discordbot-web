const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');
const Guild = require('../../models').Guild;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Verwarnt einen Nutzer')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'warn');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getUser('nutzer');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    const guildData = await Guild.findOneAndUpdate(
      { guildId: interaction.guildId },
      { $push: { warnings: { userId: target.id, moderatorId: interaction.user.id, reason, type: 'warn' } } },
      { new: true, upsert: true }
    );

    const userWarnings = guildData.warnings.filter(w => w.userId === target.id);
    const count = userWarnings.length;

    await interaction.reply({ content: `âš ï¸ **${target.username}** wurde verwarnt. (${count}. Verwarnung)\nðŸ“ Grund: ${reason}` });
    await logAction(interaction, 'warn', target, reason, `Gesamte Verwarnungen: ${count}`);

    // Auto-Aktion prÃ¼fen
    const mod = guildData.modules?.moderation;
    const threshold = mod?.autoAction?.warnThreshold || 3;
    if (count >= threshold) {
      const action = mod?.autoAction?.action || 'kick';
      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (member) {
        if (action === 'ban' && member.bannable) await member.ban({ reason: `Auto-Ban nach ${count} Verwarnungen` });
        else if (action === 'kick' && member.kickable) await member.kick(`Auto-Kick nach ${count} Verwarnungen`);
        else if (action === 'mute' || action === 'timeout') await member.timeout(86400000, `Auto-Timeout nach ${count} Verwarnungen`).catch(() => {});
        interaction.channel.send(`ðŸ¤– Auto-Aktion: **${target.username}** wurde nach **${count} Verwarnungen** automatisch **${action}**t.`).catch(() => {});
      }
    }
  }
};

