const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkModule, checkPerm } = require('../../modules/commandHelper');
const User = require('../../models').User;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Setzt das Level eines Nutzers')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addIntegerOption(o => o.setName('level').setDescription('Level').setRequired(true).setMinValue(0)),

  async execute(interaction) {
    const err = await checkModule(interaction, 'leveling');
    if (err) return interaction.reply({ content: err, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.ManageGuild, 'leveling', 'setlevel');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const target = interaction.options.getUser('nutzer');
    const level = interaction.options.getInteger('level');
    const xp = level * level * 100;

    await User.findOneAndUpdate(
      { discordId: target.id },
      { $set: { [`level.${interaction.guildId}`]: level, [`xp.${interaction.guildId}`]: xp } },
      { upsert: true }
    );
    interaction.reply({ content: `âœ… Level von **${target.username}** auf **${level}** gesetzt. (${xp} XP)` });
  }
};

