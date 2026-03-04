const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');
const User = require('../../models').User;

const REP_COOLDOWN = 24 * 60 * 60 * 1000; // 24h

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Gib jemandem einen Reputationspunkt (einmal alle 24h)')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer').setRequired(true)),

  async execute(interaction) {
    const err = await checkModule(interaction, 'economy');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getUser('nutzer');
    if (target.id === interaction.user.id)
      return interaction.reply({ content: 'âŒ Du kannst dir nicht selbst einen Reputationspunkt geben.', ephemeral: true });
    if (target.bot)
      return interaction.reply({ content: 'âŒ Du kannst keinem Bot Reputation geben.', ephemeral: true });

    const giver = await User.findOneAndUpdate(
      { discordId: interaction.user.id },
      { $setOnInsert: { discordId: interaction.user.id } },
      { upsert: true, new: true }
    );

    const lastRep = giver.lastRep ? new Date(giver.lastRep).getTime() : 0;
    const remaining = REP_COOLDOWN - (Date.now() - lastRep);

    if (remaining > 0) {
      const hours = Math.floor(remaining / 3600000);
      const mins  = Math.floor((remaining % 3600000) / 60000);
      return interaction.reply({ content: `â³ Du kannst erst in **${hours}h ${mins}m** wieder Reputation vergeben.`, ephemeral: true });
    }

    const receiver = await User.findOneAndUpdate(
      { discordId: target.id },
      { $inc: { reputation: 1 } },
      { upsert: true, new: true }
    );
    await User.updateOne({ discordId: interaction.user.id }, { $set: { lastRep: new Date() } });

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('ðŸ‘ Reputation vergeben!')
      .setDescription(`**${interaction.user.username}** hat **${target.username}** einen Reputationspunkt gegeben!`)
      .addFields({ name: 'Gesamte Reputation', value: `**${receiver.reputation}** ðŸ‘` })
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};

