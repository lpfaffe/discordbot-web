const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-unban')
    .setDescription('Hebt den Bann eines Nutzers in deinem temporären Voice-Kanal auf')
    .addUserOption(o => o
      .setName('user')
      .setDescription('Der Nutzer dessen Bann aufgehoben werden soll')
      .setRequired(true)
    ),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction)) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    const target = interaction.options.getMember('user');
    if (!target) {
      return interaction.reply({ content: '❌ Nutzer nicht gefunden.', flags: MessageFlags.Ephemeral });
    }

    // Permission-Override entfernen
    await channel.permissionOverwrites.delete(target.id).catch(() => {});

    await interaction.reply({
      content: `✅ Bann für **${target.user.username}** aufgehoben.`,
      flags: MessageFlags.Ephemeral
    });
  }
};

