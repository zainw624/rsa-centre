const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { setTransferWindow } = require('../utils/transferWindow');
const { addTransaction, createTransactionId } = require('../utils/transactions');
const { addActivityEvent } = require('../utils/dashboardStorage');
const { scheduleDashboardUpdate } = require('../events/dashboardAutoUpdate');

module.exports = {
  data: new SlashCommandBuilder().setName('twclose').setDescription('Close the transfer window for national team signings'),
  async execute(interaction) {
    const settings = await loadSettings();
    if (interaction.user.id !== settings.botOwnerId) {
      await interaction.reply({ content: '❌ Only the bot owner may use this command.', flags: 64 });
      return;
    }

    await setTransferWindow(false);
    if (interaction.client.leagueMonitor?.refreshTransferWindow) {
      await interaction.client.leagueMonitor.refreshTransferWindow().catch(() => null);
    }
    await scheduleDashboardUpdate(interaction.guild).catch(() => null);

    const transactionId = createTransactionId();
    await addTransaction({
      id: transactionId,
      type: 'transfer_window',
      status: 'closed',
      action: 'close',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      timestamp: new Date().toISOString(),
    }).catch(() => null);

    await addActivityEvent({
      emoji: '🔒',
      text: 'Transfer window closed',
      type: 'transferWindowClose',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
    }).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle('🔒 Transfer Window Closed')
      .setDescription('The transfer window is now closed for national team signings.')
      .setColor('#ED4245')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
