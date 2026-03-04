const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkModule, checkPerm } = require('../../modules/commandHelper');
const User = require('../../models').User;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setxp')
    .setDescription('Setzt die XP eines Nutzers')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true))
    .addIntegerOption(o => o.setName('xp').setDescription('XP-Wert').setRequired(true).setMinValue(0)),

  async execute(interaction) {
    const err = await checkModule(interaction, 'leveling');
    if (err) return interaction.reply({ content: err, ephemeral: true });
    const permErr = await checkPerm(interaction, PermissionFlagsBits.ManageGuild, 'leveling', 'setxp');
    if (permErr) return interaction.reply({ content: permErr, ephemeral: true });

    const target = interaction.options.getUser('nutzer');
    const xp = interaction.options.getInteger('xp');
    const level = Math.floor(0.1 * Math.sqrt(xp));

    await User.findOneAndUpdate(
      { discordId: target.id },
      { $set: { [`xp.${interaction.guildId}`]: xp, [`level.${interaction.guildId}`]: level } },
      { upsert: true }
    );
    interaction.reply({ content: `âœ… XP von **${target.username}** auf **${xp}** gesetzt. (Level ~${level})` });
  }
};

