const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models').User;
const Guild = require('../../models').Guild;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Wirtschafts-Befehle')
    .addSubcommand(s => s.setName('balance').setDescription('Zeigt dein Guthaben'))
    .addSubcommand(s => s.setName('daily').setDescription('TÃ¤gliche Coins abholen'))
    .addSubcommand(s => s.setName('work').setDescription('Arbeite fÃ¼r Coins'))
    .addSubcommand(s => s.setName('pay').setDescription('Ãœberweisung an einen Nutzer')
      .addUserOption(o => o.setName('nutzer').setDescription('EmpfÃ¤nger').setRequired(true))
      .addIntegerOption(o => o.setName('betrag').setDescription('Betrag').setRequired(true)))
    .addSubcommand(s => s.setName('leaderboard').setDescription('Coin-Rangliste')),

  async execute(interaction, client) {
    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    if (!guildData?.modules?.economy?.enabled)
      return interaction.reply({ content: 'âŒ Wirtschafts-Modul ist deaktiviert.', ephemeral: true });

    const eco = guildData.modules.economy;
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    let user = await User.findOne({ discordId: userId });
    if (!user) user = await User.create({ discordId: userId, username: interaction.user.username, discriminator: '0' });
    if (!user.economy) user.economy = new Map();

    const guildEco = user.economy?.get?.(interaction.guildId) || { balance: eco.startBalance || 0, lastDaily: null, lastWork: null };

    if (sub === 'balance') {
      const embed = new EmbedBuilder()
        .setTitle(`${eco.currencyEmoji} Guthaben von ${interaction.user.username}`)
        .setDescription(`**${guildEco.balance} ${eco.currencyName}**`)
        .setColor('#FFD700');
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'daily') {
      const now = new Date();
      const last = guildEco.lastDaily ? new Date(guildEco.lastDaily) : null;
      if (last && now - last < 86400000) {
        const next = new Date(last.getTime() + 86400000);
        return interaction.reply({ content: `â³ Du kannst wieder <t:${Math.floor(next.getTime()/1000)}:R> Coins abholen.`, ephemeral: true });
      }
      guildEco.balance += eco.dailyAmount;
      guildEco.lastDaily = now;
      await User.findOneAndUpdate({ discordId: userId }, { $set: { [`economy.${interaction.guildId}`]: guildEco } }, { upsert: true });
      return interaction.reply({ content: `${eco.currencyEmoji} Du hast **${eco.dailyAmount} ${eco.currencyName}** abgeholt! Gesamt: **${guildEco.balance}**` });
    }

    if (sub === 'work') {
      const now = new Date();
      const last = guildEco.lastWork ? new Date(guildEco.lastWork) : null;
      if (last && now - last < 3600000) {
        return interaction.reply({ content: `â³ Du kannst in <t:${Math.floor((last.getTime()+3600000)/1000)}:R> wieder arbeiten.`, ephemeral: true });
      }
      const earned = eco.workAmount + Math.floor(Math.random() * eco.workAmount);
      guildEco.balance += earned;
      guildEco.lastWork = now;
      await User.findOneAndUpdate({ discordId: userId }, { $set: { [`economy.${interaction.guildId}`]: guildEco } }, { upsert: true });
      return interaction.reply({ content: `ðŸ’¼ Du hast gearbeitet und **${earned} ${eco.currencyName}** verdient! Gesamt: **${guildEco.balance}**` });
    }

    if (sub === 'pay') {
      const target = interaction.options.getUser('nutzer');
      const amount = interaction.options.getInteger('betrag');
      if (amount <= 0) return interaction.reply({ content: 'âŒ Betrag muss positiv sein.', ephemeral: true });
      if (guildEco.balance < amount) return interaction.reply({ content: 'âŒ Nicht genug Guthaben.', ephemeral: true });
      guildEco.balance -= amount;
      await User.findOneAndUpdate({ discordId: userId }, { $set: { [`economy.${interaction.guildId}`]: guildEco } }, { upsert: true });
      let targetUser = await User.findOne({ discordId: target.id });
      if (!targetUser) targetUser = await User.create({ discordId: target.id, username: target.username, discriminator: '0' });
      const targetEco = targetUser.economy?.get?.(interaction.guildId) || { balance: 0 };
      targetEco.balance += amount;
      await User.findOneAndUpdate({ discordId: target.id }, { $set: { [`economy.${interaction.guildId}`]: targetEco } }, { upsert: true });
      return interaction.reply({ content: `${eco.currencyEmoji} Du hast **${amount} ${eco.currencyName}** an <@${target.id}> Ã¼berwiesen!` });
    }

    if (sub === 'leaderboard') {
      const allUsers = await User.find({ [`economy.${interaction.guildId}.balance`]: { $exists: true } }).limit(10);
      const sorted = allUsers.sort((a, b) => (b.economy?.get?.(interaction.guildId)?.balance || 0) - (a.economy?.get?.(interaction.guildId)?.balance || 0));
      const embed = new EmbedBuilder()
        .setTitle(`${eco.currencyEmoji} ${eco.currencyName} Rangliste`)
        .setDescription(sorted.map((u, i) => `**${i+1}.** <@${u.discordId}> - ${u.economy?.get?.(interaction.guildId)?.balance || 0} ${eco.currencyName}`).join('\n') || 'Noch keine Daten')
        .setColor('#FFD700');
      return interaction.reply({ embeds: [embed] });
    }
  }
};


