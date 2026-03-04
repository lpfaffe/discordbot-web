const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Zeigt die Bot-Latenz'),

  async execute(interaction, client) {
    const sent = await interaction.reply({ content: '📡 Messe...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({
      content: null,
      embeds: [new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏓 Pong!')
        .addFields(
          { name: '📡 Bot Latenz', value: `${latency}ms`, inline: true },
          { name: '💓 API Latenz', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp()]
    });
  }
};


