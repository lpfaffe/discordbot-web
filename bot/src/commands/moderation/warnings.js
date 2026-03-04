const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../../../shared/models/Warning');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Zeigt Verwarnungen eines Users')
    .addUserOption(o => o.setName('user').setDescription('Der User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warnings = await Warning.find({
      guildId: interaction.guild.id,
      userId: target.id
    }).sort({ createdAt: -1 }).limit(10);

    if (warnings.length === 0) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor('#00FF00').setDescription(`✅ ${target.tag} hat keine Verwarnungen.`)],
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle(`⚠️ Verwarnungen von ${target.tag}`)
      .setThumbnail(target.displayAvatarURL())
      .setDescription(warnings.map((w, i) =>
        `**#${i + 1}** \`${w.type.toUpperCase()}\` - ${w.reason}\n👮 <@${w.moderatorId}> • ${new Date(w.createdAt).toLocaleDateString('de-DE')}`
      ).join('\n\n'))
      .setFooter({ text: `Gesamt: ${warnings.length} Einträge` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};


