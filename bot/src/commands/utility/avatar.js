const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Zeigt den Avatar eines Nutzers')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer (leer = du selbst)')),

  async execute(interaction) {
    const err = await checkModule(interaction, 'utility');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getUser('nutzer') || interaction.user;
    const url = target.displayAvatarURL({ size: 1024, extension: 'png' });
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar von ${target.username}`)
      .setImage(url)
      .setColor('#5865F2')
      .addFields({ name: 'Links', value: `[PNG](${target.displayAvatarURL({ size: 1024, extension: 'png' })}) | [JPG](${target.displayAvatarURL({ size: 1024, extension: 'jpg' })}) | [WEBP](${target.displayAvatarURL({ size: 1024, extension: 'webp' })})` })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};

