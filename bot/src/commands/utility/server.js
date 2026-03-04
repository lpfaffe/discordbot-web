const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { checkModule } = require('../../modules/commandHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Zeigt Informationen über den Server'),

  async execute(interaction) {
    const err = await checkModule(interaction, 'utility');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const g = interaction.guild;
    await g.fetch();
    const online = g.members.cache.filter(m => m.presence?.status !== 'offline').size;

    const embed = new EmbedBuilder()
      .setTitle(`🏠 ${g.name}`)
      .setThumbnail(g.iconURL({ size: 256 }))
      .setColor('#5865F2')
      .addFields(
        { name: '🆔 ID', value: g.id, inline: true },
        { name: '👑 Besitzer', value: `<@${g.ownerId}>`, inline: true },
        { name: '📅 Erstellt', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Mitglieder', value: `${g.memberCount}`, inline: true },
        { name: '🟢 Online', value: `${online}`, inline: true },
        { name: '🤖 Bots', value: `${g.members.cache.filter(m => m.user.bot).size}`, inline: true },
        { name: '💬 Textkanäle', value: `${g.channels.cache.filter(c => c.type === 0).size}`, inline: true },
        { name: '🔊 Sprachkanäle', value: `${g.channels.cache.filter(c => c.type === 2).size}`, inline: true },
        { name: '🎭 Rollen', value: `${g.roles.cache.size}`, inline: true },
        { name: '😀 Emojis', value: `${g.emojis.cache.size}`, inline: true },
        { name: '💎 Boosts', value: `${g.premiumSubscriptionCount} (Stufe ${g.premiumTier})`, inline: true },
        { name: '🔒 Verifizierung', value: `${['Keine','Niedrig','Mittel','Hoch','Sehr hoch'][g.verificationLevel]}`, inline: true },
      )
      .setImage(g.bannerURL({ size: 1024 }) || null)
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  }
};

