const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Guild = require('../../models').Guild;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Geburtstags-Befehle')
    .addSubcommand(s => s.setName('set').setDescription('Setze deinen Geburtstag')
      .addIntegerOption(o => o.setName('tag').setDescription('Tag (1-31)').setRequired(true).setMinValue(1).setMaxValue(31))
      .addIntegerOption(o => o.setName('monat').setDescription('Monat (1-12)').setRequired(true).setMinValue(1).setMaxValue(12)))
    .addSubcommand(s => s.setName('get').setDescription('Zeige den Geburtstag eines Nutzers')
      .addUserOption(o => o.setName('nutzer').setDescription('Nutzer'))),

  async execute(interaction, client) {
    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    if (!guildData?.modules?.birthdays?.enabled)
      return interaction.reply({ content: 'âŒ Geburtstags-Modul ist deaktiviert.', ephemeral: true });

    const User = require('../../models').User;
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const day = interaction.options.getInteger('tag');
      const month = interaction.options.getInteger('monat');
      await User.findOneAndUpdate(
        { discordId: interaction.user.id },
        { birthday: { day, month } },
        { upsert: true, new: true }
      );
      return interaction.reply({ content: `ðŸŽ‚ Dein Geburtstag wurde auf **${day}.${month}.** gesetzt!`, ephemeral: true });
    }

    if (sub === 'get') {
      const target = interaction.options.getUser('nutzer') || interaction.user;
      const user = await User.findOne({ discordId: target.id });
      if (!user?.birthday) return interaction.reply({ content: `âŒ ${target.username} hat keinen Geburtstag hinterlegt.`, ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('ðŸŽ‚ Geburtstag')
        .setDescription(`**${target.username}** hat am **${user.birthday.day}.${user.birthday.month}.** Geburtstag!`)
        .setColor('#FF69B4').setThumbnail(target.displayAvatarURL());
      return interaction.reply({ embeds: [embed] });
    }
  }
};


