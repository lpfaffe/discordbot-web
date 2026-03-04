const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');
const User = require('../../../../shared/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('credits')
    .setDescription('Zeigt dein Guthaben oder das von jemand anderem')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer (leer = du)')),

  async execute(interaction) {
    const err = await checkModule(interaction, 'economy');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getUser('nutzer') || interaction.user;
    const userData = await User.findOneAndUpdate(
      { discordId: target.id },
      { $setOnInsert: { discordId: target.id } },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle(`💰 Guthaben von ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: '💵 Guthaben', value: `**${userData.credits || 0}** Credits`, inline: true },
        { name: '🏦 Bank', value: `**${userData.bank || 0}** Credits`, inline: true },
        { name: '📊 Gesamt', value: `**${(userData.credits || 0) + (userData.bank || 0)}** Credits`, inline: true },
        { name: '👍 Reputation', value: `**${userData.reputation || 0}**`, inline: true }
      )
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};

