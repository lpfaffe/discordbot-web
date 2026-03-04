const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Entsperrt einen Kanal für @everyone')
    .addChannelOption(o => o.setName('kanal').setDescription('Kanal (leer = aktueller)')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'unlock');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const channel = interaction.options.getChannel('kanal') || interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.reply({ content: `🔓 <#${channel.id}> wurde entsperrt.` });
    await logAction(interaction, 'unlock', null, 'Kanal entsperrt', `Kanal: <#${channel.id}>`);
  }
};


