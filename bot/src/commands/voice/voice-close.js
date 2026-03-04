const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');
const { removeChannel } = require('../../modules/tempChannels');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-close')
    .setDescription('Löscht deinen temporären Voice-Kanal'),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction, 'close')) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    await interaction.reply({ content: '🗑️ Kanal wird gelöscht...', flags: MessageFlags.Ephemeral });
    removeChannel(channel.id);
    await channel.delete('Vom Owner geschlossen').catch(() => {});
  }
};

