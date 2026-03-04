const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Zeigt Informationen über einen Nutzer')
    .addUserOption(o => o.setName('nutzer').setDescription('Nutzer (leer = du selbst)')),

  async execute(interaction) {
    const err = await checkModule(interaction, 'utility');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const target = interaction.options.getMember('nutzer') || interaction.member;
    const user = target.user;
    const roles = target.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(', ') || 'Keine';

    const embed = new EmbedBuilder()
      .setTitle(`👤 ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setColor('#5865F2')
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Ja' : 'Nein', inline: true },
        { name: '📅 Account erstellt', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '📥 Server beigetreten', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '🎭 Höchste Rolle', value: `${target.roles.highest}`, inline: true },
        { name: '💬 Nickname', value: target.nickname || 'Keiner', inline: true },
        { name: `🎭 Rollen (${target.roles.cache.size - 1})`, value: roles.length > 1024 ? roles.slice(0, 1020) + '...' : roles }
      )
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};

