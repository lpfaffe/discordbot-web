const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Guild = require('../../models').Guild;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Erinnerungs-Befehle')
    .addSubcommand(s => s.setName('add').setDescription('Erinnerung hinzufÃ¼gen')
      .addChannelOption(o => o.setName('kanal').setDescription('Ziel-Kanal').setRequired(true))
      .addStringOption(o => o.setName('nachricht').setDescription('Nachricht').setRequired(true))
      .addIntegerOption(o => o.setName('minuten').setDescription('Interval in Minuten').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('Alle Erinnerungen anzeigen'))
    .addSubcommand(s => s.setName('remove').setDescription('Erinnerung entfernen')
      .addIntegerOption(o => o.setName('index').setDescription('Nummer der Erinnerung').setRequired(true))),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has('ManageGuild'))
      return interaction.reply({ content: 'âŒ Keine Berechtigung.', ephemeral: true });

    const guildData = await Guild.findOne({ guildId: interaction.guildId });
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const channel = interaction.options.getChannel('kanal');
      const message = interaction.options.getString('nachricht');
      const minutes = interaction.options.getInteger('minuten');
      await Guild.findOneAndUpdate(
        { guildId: interaction.guildId },
        { $push: { 'modules.reminders.items': { channelId: channel.id, message, interval: minutes * 60000, lastSent: new Date(), active: true } } }
      );
      return interaction.reply({ content: `âœ… Erinnerung alle **${minutes} Minuten** in <#${channel.id}> gesetzt.` });
    }

    if (sub === 'list') {
      const items = guildData?.modules?.reminders?.items || [];
      if (!items.length) return interaction.reply({ content: 'Keine aktiven Erinnerungen.', ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('â° Erinnerungen')
        .setDescription(items.map((r, i) => `**${i+1}.** <#${r.channelId}> alle ${r.interval/60000}min: "${r.message}"`).join('\n'))
        .setColor('#5865F2');
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const idx = interaction.options.getInteger('index') - 1;
      const items = guildData?.modules?.reminders?.items || [];
      if (idx < 0 || idx >= items.length) return interaction.reply({ content: 'âŒ UngÃ¼ltiger Index.', ephemeral: true });
      items.splice(idx, 1);
      await Guild.findOneAndUpdate({ guildId: interaction.guildId }, { $set: { 'modules.reminders.items': items } });
      return interaction.reply({ content: 'âœ… Erinnerung entfernt.' });
    }
  }
};


