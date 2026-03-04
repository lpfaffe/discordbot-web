const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const { checkPerm, checkModule } = require('../../modules/commandHelper');
const User = require('../../models').User;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('points')
    .setDescription('Punkte-System fÃ¼r Moderatoren')
    .addSubcommand(s => s.setName('add').setDescription('Punkte hinzufÃ¼gen')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
      .addIntegerOption(o => o.setName('punkte').setDescription('Punkte').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('remove').setDescription('Punkte entfernen')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
      .addIntegerOption(o => o.setName('punkte').setDescription('Punkte').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('set').setDescription('Punkte setzen')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
      .addIntegerOption(o => o.setName('punkte').setDescription('Punkte').setRequired(true).setMinValue(0)))
    .addSubcommand(s => s.setName('show').setDescription('Punkte anzeigen')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer'))),

  async execute(interaction) {
    const modErr = await checkModule(interaction, 'moderation');
    if (modErr) return interaction.reply({ content: modErr, ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getUser('nutzer') || interaction.user;

    if (sub !== 'show') {
      const permErr = await checkPerm(interaction, PermissionFlagsBits.ManageGuild, 'moderation', 'points');
      if (permErr) return interaction.reply({ content: permErr, ephemeral: true });
    }

    const userData = await User.findOneAndUpdate(
      { discordId: target.id },
      { $setOnInsert: { discordId: target.id } },
      { upsert: true, new: true }
    );

    const points = parseInt(userData.points?.[interaction.guildId] || 0);
    let newPoints = points;

    if (sub === 'add') newPoints = points + interaction.options.getInteger('punkte');
    else if (sub === 'remove') newPoints = Math.max(0, points - interaction.options.getInteger('punkte'));
    else if (sub === 'set') newPoints = interaction.options.getInteger('punkte');

    if (sub !== 'show') {
      await User.updateOne({ discordId: target.id }, { $set: { [`points.${interaction.guildId}`]: newPoints } });
    }

    const embed = new EmbedBuilder()
      .setTitle(`ðŸ“Š Punkte von ${target.username}`)
      .setColor('#5865F2')
      .addFields({ name: 'Punkte', value: `**${sub === 'show' ? points : newPoints}**` })
      .setThumbnail(target.displayAvatarURL())
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};

