const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');
const User = require('../../models').User;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Zeigt die Top-Mitglieder')
    .addStringOption(o => o.setName('typ').setDescription('Rangliste-Typ').setRequired(false)
      .addChoices(
        { name: 'â­ XP / Level', value: 'xp' },
        { name: 'ðŸ’° Guthaben', value: 'credits' },
        { name: 'ðŸ“Š Punkte', value: 'points' },
        { name: 'ðŸ‘ Reputation', value: 'rep' }
      )),

  async execute(interaction) {
    const err = await checkModule(interaction, 'leveling');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const typ = interaction.options.getString('typ') || 'xp';
    const gid = interaction.guildId;

    await interaction.deferReply();
    const users = await User.find({ discordId: { $exists: true } });

    let sorted;
    if (typ === 'xp') sorted = users.sort((a, b) => (b.xp?.[gid] || 0) - (a.xp?.[gid] || 0));
    else if (typ === 'credits') sorted = users.sort((a, b) => (b.credits || 0) - (a.credits || 0));
    else if (typ === 'points') sorted = users.sort((a, b) => (b.points?.[gid] || 0) - (a.points?.[gid] || 0));
    else if (typ === 'rep') sorted = users.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));

    const top = sorted.slice(0, 10);
    const medals = ['ðŸ¥‡', 'ðŸ¥ˆ', 'ðŸ¥‰'];

    const fields = await Promise.all(top.map(async (u, i) => {
      const member = await interaction.guild.members.fetch(u.discordId).catch(() => null);
      const name = member?.user.username || `ID: ${u.discordId}`;
      let value = '';
      if (typ === 'xp') value = `Level **${u.level?.[gid] || 0}** â€” ${u.xp?.[gid] || 0} XP`;
      else if (typ === 'credits') value = `ðŸ’° **${u.credits || 0}** Credits`;
      else if (typ === 'points') value = `ðŸ“Š **${u.points?.[gid] || 0}** Punkte`;
      else if (typ === 'rep') value = `ðŸ‘ **${u.reputation || 0}** Rep`;
      return { name: `${medals[i] || `**${i + 1}.**`} ${name}`, value, inline: false };
    }));

    const titles = { xp: 'â­ XP-Rangliste', credits: 'ðŸ’° Guthaben-Rangliste', points: 'ðŸ“Š Punkte-Rangliste', rep: 'ðŸ‘ Reputation-Rangliste' };
    const embed = new EmbedBuilder().setTitle(titles[typ]).setColor('#5865F2').addFields(fields).setTimestamp();
    interaction.editReply({ embeds: [embed] });
  }
};

