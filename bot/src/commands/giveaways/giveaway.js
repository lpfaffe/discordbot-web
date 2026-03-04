const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Guild = require('../../../../shared/models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Gewinnspiel-Befehle')
    .addSubcommand(s => s.setName('start').setDescription('Starte ein Gewinnspiel')
      .addStringOption(o => o.setName('preis').setDescription('Was wird verlost?').setRequired(true))
      .addIntegerOption(o => o.setName('dauer').setDescription('Dauer in Minuten').setRequired(true))
      .addIntegerOption(o => o.setName('gewinner').setDescription('Anzahl Gewinner').setRequired(false)))
    .addSubcommand(s => s.setName('end').setDescription('Beende ein Gewinnspiel')
      .addStringOption(o => o.setName('message_id').setDescription('Nachrichten-ID des Gewinnspiels').setRequired(true)))
    .addSubcommand(s => s.setName('reroll').setDescription('Neues Gewinnspiel auslosen')
      .addStringOption(o => o.setName('message_id').setDescription('Nachrichten-ID').setRequired(true))),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    if (!guildData?.modules?.giveaways?.enabled)
      return interaction.reply({ content: '❌ Gewinnspiel-Modul ist deaktiviert.', ephemeral: true });

    if (sub === 'start') {
      const preis = interaction.options.getString('preis');
      const dauerMin = interaction.options.getInteger('dauer');
      const gewinner = interaction.options.getInteger('gewinner') || 1;
      const endsAt = new Date(Date.now() + dauerMin * 60 * 1000);

      const embed = new EmbedBuilder()
        .setTitle('🎉 GEWINNSPIEL 🎉')
        .setDescription(`**Preis:** ${preis}\n\n Reagiere mit 🎉 um teilzunehmen!\n\n**Gewinner:** ${gewinner}\n**Endet:** <t:${Math.floor(endsAt.getTime()/1000)}:R>`)
        .setColor('#FFD700')
        .setFooter({ text: `${gewinner} Gewinner | Endet` })
        .setTimestamp(endsAt);

      const button = new ButtonBuilder().setCustomId('giveaway_join').setLabel('🎉 Mitmachen').setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(button);

      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

      setTimeout(async () => {
        try {
          const fetchedMsg = await interaction.channel.messages.fetch(msg.id);
          const reactions = fetchedMsg.reactions.cache.get('🎉');
          if (!reactions) return interaction.channel.send('❌ Keine Teilnehmer beim Gewinnspiel.');
          const users = await reactions.users.fetch();
          const participants = users.filter(u => !u.bot);
          if (!participants.size) return interaction.channel.send('❌ Keine Teilnehmer.');
          const winners = participants.random(Math.min(gewinner, participants.size));
          const winnerList = Array.isArray(winners) ? winners.map(w => `<@${w.id}>`).join(', ') : `<@${winners.id}>`;
          interaction.channel.send({ content: `🎉 Glückwunsch ${winnerList}! Ihr habt **${preis}** gewonnen!` });
        } catch (e) { console.error('Giveaway Ende Fehler:', e); }
      }, dauerMin * 60 * 1000);

    } else if (sub === 'end' || sub === 'reroll') {
      const msgId = interaction.options.getString('message_id');
      try {
        const msg = await interaction.channel.messages.fetch(msgId);
        const reactions = msg.reactions.cache.get('🎉');
        if (!reactions) return interaction.reply({ content: '❌ Keine Reaktionen gefunden.', ephemeral: true });
        const users = await reactions.users.fetch();
        const participants = users.filter(u => !u.bot);
        if (!participants.size) return interaction.reply({ content: '❌ Keine Teilnehmer.', ephemeral: true });
        const winner = participants.random();
        interaction.reply({ content: `🎉 Neuer Gewinner: <@${winner.id}>! Glückwunsch!` });
      } catch (e) {
        interaction.reply({ content: `❌ Fehler: ${e.message}`, ephemeral: true });
      }
    }
  }
};


