const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getTempChannel, checkControlChannel } = require('./_voiceHelper');

module.exports = {
  category: 'voice',
  data: new SlashCommandBuilder()
    .setName('voice-rename')
    .setDescription('Ändert den Namen deines temporären Voice-Kanals')
    .addStringOption(o => o
      .setName('name')
      .setDescription('Neuer Kanalname (max. 100 Zeichen)')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(100)
    ),

  async execute(interaction, client) {
    if (!await checkControlChannel(interaction)) return;
    const channel = await getTempChannel(interaction);
    if (!channel) return;

    const name = interaction.options.getString('name');
    await channel.setName(name);
    await interaction.reply({
      content: `✅ Kanal wurde in **${name}** umbenannt.`,
      flags: MessageFlags.Ephemeral
    });
  }
};

