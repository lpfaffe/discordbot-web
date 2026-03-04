const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Guild = require('../../models').Guild;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Erstelle eine Umfrage')
    .addStringOption(o => o.setName('frage').setDescription('Die Frage').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3'))
    .addStringOption(o => o.setName('option4').setDescription('Option 4'))
    .addIntegerOption(o => o.setName('dauer').setDescription('Dauer in Minuten (0 = kein Limit)')),

  async execute(interaction, client) {
    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    if (!guildData?.modules?.polls?.enabled)
      return interaction.reply({ content: 'âŒ Umfrage-Modul ist deaktiviert.', ephemeral: true });

    const frage = interaction.options.getString('frage');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
    ].filter(Boolean);

    const emojis = ['1ï¸âƒ£', '2ï¸âƒ£', '3ï¸âƒ£', '4ï¸âƒ£'];
    const dauer = interaction.options.getInteger('dauer') || 0;

    const embed = new EmbedBuilder()
      .setTitle('ðŸ“Š ' + frage)
      .setDescription(options.map((o, i) => `${emojis[i]} ${o}`).join('\n\n'))
      .setColor('#5865F2')
      .setFooter({ text: `Umfrage von ${interaction.user.username}${dauer ? ` â€¢ Endet in ${dauer} Minuten` : ''}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    const msg = await interaction.fetchReply();
    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }

    if (dauer > 0) {
      setTimeout(async () => {
        try {
          const fetchedMsg = await interaction.channel.messages.fetch(msg.id);
          const results = options.map((o, i) => {
            const reaction = fetchedMsg.reactions.cache.get(emojis[i]);
            return { option: o, count: (reaction?.count || 1) - 1 };
          }).sort((a, b) => b.count - a.count);

          const resultEmbed = new EmbedBuilder()
            .setTitle('ðŸ“Š Ergebnis: ' + frage)
            .setDescription(results.map((r, i) => `**${i+1}.** ${r.option}: **${r.count}** Stimmen`).join('\n'))
            .setColor('#57F287').setTimestamp();
          interaction.channel.send({ embeds: [resultEmbed] });
        } catch (e) { console.error('Poll Ende:', e); }
      }, dauer * 60 * 1000);
    }
  }
};


