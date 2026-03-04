const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Spielt Musik ab (YouTube, Spotify, SoundCloud, ...)')
    .addStringOption(o => o
      .setName('suche')
      .setDescription('Song-Name oder URL (YouTube, Spotify, SoundCloud)')
      .setRequired(true)
    ),

  async execute(interaction, client) {
    const query       = interaction.options.getString('suche');
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Du musst in einem Voice-Kanal sein!',
        flags: MessageFlags.Ephemeral
      });
    }

    // Prüfen ob Bot die nötigen Permissions hat
    const botMember = interaction.guild.members.me;
    const perms = voiceChannel.permissionsFor(botMember);
    if (!perms.has('Connect')) {
      return interaction.reply({ content: '❌ Ich habe keine Berechtigung dem Voice-Kanal beizutreten!', flags: MessageFlags.Ephemeral });
    }
    if (!perms.has('Speak')) {
      return interaction.reply({ content: '❌ Ich habe keine Berechtigung in diesem Voice-Kanal zu sprechen!', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    try {
      // Bot-Self-Mute/Deaf aufheben falls gesetzt
      if (botMember.voice?.channelId) {
        await botMember.voice.setSelfMute(false).catch(() => {});
        await botMember.voice.setSelfDeaf(false).catch(() => {});
      }

      await client.distube.play(voiceChannel, query, {
        member:      interaction.member,
        textChannel: interaction.channel,
        interaction
      });

      // playSong Event sendet die Antwort – nur bestätigen wenn noch nicht beantwortet
      if (!interaction.replied) {
        await interaction.editReply({ content: `🔍 Suche: **${query}**...` });
      }
    } catch (err) {
      console.error('[Play] Fehler:', err);
      const msg = err.message || 'Unbekannter Fehler';

      let hint = '';
      if (msg.includes('30 seconds') || msg.includes('voice channel')) {
        hint = '\n💡 **Tipp:** Stelle sicher dass der Bot Berechtigung hat dem Voice-Kanal beizutreten und zu sprechen.';
      } else if (msg.includes('yt-dlp') || msg.includes('youtube')) {
        hint = '\n💡 **Tipp:** Versuche eine andere URL oder einen anderen Suchbegriff.';
      }

      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Fehler beim Abspielen')
          .setDescription(`\`${msg.slice(0, 300)}\`${hint}`)
        ]
      });
    }
  }
};
