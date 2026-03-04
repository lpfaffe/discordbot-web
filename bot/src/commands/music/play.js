const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Spielt Musik ab')
    .addStringOption(o => o.setName('suche').setDescription('Song-Name oder URL').setRequired(true)),

  async execute(interaction, client) {
    const query = interaction.options.getString('suche');
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Du musst in einem Sprachkanal sein!', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      await client.distube.play(voiceChannel, query, {
        member: interaction.member,
        textChannel: interaction.channel,
        interaction
      });
      // DisTube sendet eigene Events für Song-Anzeige
    } catch (err) {
      console.error('Play Fehler:', err);
      await interaction.editReply({ content: `❌ Fehler: ${err.message}` });
    }
  }
};


