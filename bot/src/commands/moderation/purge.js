const { SlashCommandBuilder } = require('discord.js');
const { checkPermission, logAction } = require('../../modules/modHelpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Löscht mehrere Nachrichten auf einmal')
    .addIntegerOption(o => o.setName('anzahl').setDescription('Anzahl (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('nutzer').setDescription('Nur Nachrichten dieses Nutzers löschen')),

  async execute(interaction) {
    const err = await checkPermission(interaction, 'purge');
    if (err) return interaction.reply({ content: err, ephemeral: true });

    const count = interaction.options.getInteger('anzahl');
    const filterUser = interaction.options.getUser('nutzer');

    await interaction.deferReply({ ephemeral: true });

    let messages = await interaction.channel.messages.fetch({ limit: count });
    if (filterUser) messages = messages.filter(m => m.author.id === filterUser.id);

    const deleted = await interaction.channel.bulkDelete(messages, true).catch(() => null);
    const delCount = deleted?.size || 0;

    await interaction.editReply({ content: `🧹 **${delCount}** Nachrichten gelöscht.` });
    await logAction(interaction, 'purge', filterUser, `${delCount} Nachrichten gelöscht`, filterUser ? `Filter: @${filterUser.username}` : 'Alle Nachrichten');
  }
};

