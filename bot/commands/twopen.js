const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { setTransferWindow } = require('../utils/transferWindow');
const { addTransaction, createTransactionId } = require('../utils/transactions');
const { addActivityEvent } = require('../utils/dashboardStorage');
const { scheduleDashboardUpdate } = require('../events/dashboardAutoUpdate');

module.exports = {
  data: new SlashCommandBuilder().setName('twopen').setDescription('Open the transfer window for national team signings'),
  async execute(interaction) {
    const settings = await loadSettings();
    if (interaction.user.id !== settings.botOwnerId) {
      await interaction.reply({ content: '❌ Only the bot owner may use this command.', flags: 64 });
      return;
    }

    if (settings.worldCupMode) {
      await interaction.reply({ content: '❌ The transfer window cannot be opened while World Cup roster lock is active.', flags: 64 });
      return;
    }

    await setTransferWindow(true);
    if (interaction.client.leagueMonitor?.refreshTransferWindow) {
      await interaction.client.leagueMonitor.refreshTransferWindow().catch(() => null);
    }
    await scheduleDashboardUpdate(interaction.guild).catch(() => null);

    const transactionId = createTransactionId();
    await addTransaction({
      id: transactionId,
      type: 'transfer_window',
      status: 'open',
      action: 'open',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
      timestamp: new Date().toISOString(),
    }).catch(() => null);

    await addActivityEvent({
      emoji: '🔓',
      text: 'Transfer window opened',
      type: 'transferWindowOpen',
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
    }).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle('🔓 Transfer Window Open')
      .setDescription('The transfer window is now open for national team signings.')
      .setColor('#00B37E')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
