const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../../models').Warning;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription('LÃ¶scht alle Verwarnungen eines Users')
    .addUserOption(o => o.setName('user').setDescription('Der User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const result = await Warning.deleteMany({ guildId: interaction.guild.id, userId: target.id });

    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor('#00FF00')
        .setDescription(`âœ… **${result.deletedCount}** Verwarnungen von **${target.tag}** gelÃ¶scht.`)
        .setTimestamp()],
      ephemeral: true
    });
  }
};


