/**
 * distube.js – DisTube Event Handler
 * Registriert alle Musik-Events: playSong, addSong, error, etc.
 * Läuft NACH dem clientReady Event
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    const distube = client.distube;
    if (!distube) return;

    // Song startet
    distube.on('playSong', (queue, song) => {
      const embed = new EmbedBuilder()
        .setColor('#1DB954')
        .setTitle('▶️ Spielt jetzt')
        .setDescription(`**[${song.name}](${song.url})**`)
        .addFields(
          { name: '⏱️ Dauer',    value: song.formattedDuration || 'Live', inline: true },
          { name: '👤 Angefragt', value: song.member?.toString() || 'Unbekannt', inline: true },
          { name: '🔊 Lautstärke', value: `${queue.volume}%`, inline: true }
        )
        .setThumbnail(song.thumbnail)
        .setTimestamp();

      queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
    });

    // Song zur Warteschlange hinzugefügt
    distube.on('addSong', (queue, song) => {
      queue.textChannel?.send({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setDescription(`➕ **[${song.name}](${song.url})** zur Warteschlange hinzugefügt. Position: **${queue.songs.length}**`)
        ]
      }).catch(() => {});
    });

    // Playlist hinzugefügt
    distube.on('addList', (queue, playlist) => {
      queue.textChannel?.send({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setDescription(`📋 **${playlist.name}** (${playlist.songs.length} Songs) zur Warteschlange hinzugefügt.`)
        ]
      }).catch(() => {});
    });

    // Warteschlange leer
    distube.on('finish', (queue) => {
      queue.textChannel?.send({
        embeds: [new EmbedBuilder()
          .setColor('#FF0000')
          .setDescription('⏹️ Warteschlange leer – Bot verlässt den Voice-Kanal.')
        ]
      }).catch(() => {});
    });

    // Fehler
    distube.on('error', (error, queue, song) => {
      console.error('[DisTube] Fehler:', error);
      const ch = queue?.textChannel;
      if (ch) {
        ch.send({
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Musik-Fehler')
            .setDescription(`\`\`\`${error.message?.slice(0, 400) || 'Unbekannter Fehler'}\`\`\``)
          ]
        }).catch(() => {});
      }
    });

    // Kein Ergebnis gefunden
    distube.on('searchNoResult', (message, query) => {
      message.channel?.send(`❌ Kein Ergebnis für: **${query}**`).catch(() => {});
    });

    console.log('🎵 DisTube Events registriert');
  }
};

