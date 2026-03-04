const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');
const User = require('../../models').User;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Zeigt die Server-Rangkarte')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer (leer = du)')),

  async execute(interaction) {
    const err = await checkModule(interaction, 'leveling');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getUser('nutzer') || interaction.user;
    const gid = interaction.guildId;

    const user = await User.findOne({ discordId: target.id });
    const xp    = user?.xp?.get?.(gid)    || 0;
    const level = user?.level?.get?.(gid)  || 0;

    const xpForNext = 5 * (level ** 2) + 50 * level + 100;
    const progress = Math.min(100, Math.floor((xp / xpForNext) * 100));
    const bar = 'â–ˆ'.repeat(Math.floor(progress / 5)) + 'â–‘'.repeat(20 - Math.floor(progress / 5));

    // Rang berechnen
    const allUsers = await User.find({});
    const sorted = allUsers
      .map(u => ({ id: u.discordId, xp: u.xp?.get?.(gid) || 0 }))
      .sort((a, b) => b.xp - a.xp);
    const rank = sorted.findIndex(u => u.id === target.id) + 1;

    const embed = new EmbedBuilder()
      .setTitle(`ðŸ“Š Rang von ${target.username}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setColor('#5865F2')
      .addFields(
        { name: 'ðŸ† Rang', value: `**#${rank || '?'}**`, inline: true },
        { name: 'â­ Level', value: `**${level}**`, inline: true },
        { name: 'âœ¨ XP', value: `**${xp}** / ${xpForNext}`, inline: true },
        { name: `ðŸ“ˆ Fortschritt (${progress}%)`, value: `\`${bar}\`` }
      )
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};
