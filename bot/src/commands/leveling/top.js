const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');
const User = require('../../../../shared/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Zeigt die Top-Mitglieder')
    .addStringOption(o => o.setName('typ').setDescription('Rangliste-Typ').setRequired(false)
      .addChoices(
        { name: '⭐ XP / Level', value: 'xp' },
        { name: '💰 Guthaben', value: 'credits' },
        { name: '📊 Punkte', value: 'points' },
        { name: '👍 Reputation', value: 'rep' }
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
    const medals = ['🥇', '🥈', '🥉'];

    const fields = await Promise.all(top.map(async (u, i) => {
      const member = await interaction.guild.members.fetch(u.discordId).catch(() => null);
      const name = member?.user.username || `ID: ${u.discordId}`;
      let value = '';
      if (typ === 'xp') value = `Level **${u.level?.[gid] || 0}** — ${u.xp?.[gid] || 0} XP`;
      else if (typ === 'credits') value = `💰 **${u.credits || 0}** Credits`;
      else if (typ === 'points') value = `📊 **${u.points?.[gid] || 0}** Punkte`;
      else if (typ === 'rep') value = `👍 **${u.reputation || 0}** Rep`;
      return { name: `${medals[i] || `**${i + 1}.**`} ${name}`, value, inline: false };
    }));

    const titles = { xp: '⭐ XP-Rangliste', credits: '💰 Guthaben-Rangliste', points: '📊 Punkte-Rangliste', rep: '👍 Reputation-Rangliste' };
    const embed = new EmbedBuilder().setTitle(titles[typ]).setColor('#5865F2').addFields(fields).setTimestamp();
    interaction.editReply({ embeds: [embed] });
  }
};

