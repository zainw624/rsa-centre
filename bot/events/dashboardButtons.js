const { loadDashboard, saveDashboard } = require('../utils/dashboardStorage');
const { scanLeadership } = require('../utils/leadership');
const { updateDashboard } = require('../utils/dashboard');
const { loadTransferWindow } = require('../utils/transferWindow');
const { loadSettings } = require('../utils/settings');

/**
 * Handle dashboard button interactions
 */
async function handleDashboardButtons(interaction) {
  if (!interaction.isButton()) return;

  const validCustomIds = ['dashboard-prev', 'dashboard-next', 'dashboard-refresh'];
  if (!validCustomIds.includes(interaction.customId)) return;

  try {
    const dashboard = await loadDashboard();

    if (dashboard.messageId !== interaction.message.id) return;
    if (dashboard.guildId !== interaction.guildId) return;

    let currentPage = dashboard.currentPage || 0;

    if (interaction.customId === 'dashboard-prev') {
      currentPage = Math.max(0, currentPage - 1);
    } else if (interaction.customId === 'dashboard-next') {
      currentPage = Math.min(1, currentPage + 1);
    }
    // refresh keeps the current page

    // Scan current leadership
    const { leadership } = await scanLeadership(interaction.guild);

    const transferWindowOpen = await loadTransferWindow();
    const settings = await loadSettings();
    const worldCupMode = settings.worldCupMode || false;
    // Update the dashboard message
    await updateDashboard(interaction.message, leadership, currentPage, null, transferWindowOpen, worldCupMode);

    // Update stored page
    dashboard.currentPage = currentPage;
    dashboard.lastUpdated = new Date().toISOString();
    await saveDashboard(dashboard);

    // Acknowledge the button press
    await interaction.deferUpdate().catch(() => null);
  } catch (error) {
    console.error('Error handling dashboard button:', error);
    await interaction.reply({
      content: '❌ Error updating dashboard',
      flags: 64,
    }).catch(() => null);
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    await handleDashboardButtons(interaction);
  },
};
