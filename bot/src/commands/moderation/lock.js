const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Sperrt einen Kanal für @everyone')
    .addChannelOption(o => o.setName('kanal').setDescription('Kanal (leer = aktueller)'))
    .addStringOption(o => o.setName('grund').setDescription('Grund')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'lock');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const channel = interaction.options.getChannel('kanal') || interaction.channel;
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.reply({ content: `🔒 <#${channel.id}> wurde gesperrt.\n📝 Grund: ${reason}` });
    await logAction(interaction, 'lock', null, reason, `Kanal: <#${channel.id}>`);
  }
};


