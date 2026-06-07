const dashboardStore = require('../storage/DashboardStore');

class DashboardManager {
  constructor(dashboardService) {
    this.dashboardService = dashboardService;
    this.dashboardState = null;
  }

  async initialize() {
    this.dashboardState = await dashboardStore.load();
    await this.dashboardService.initialize();
  }

  async validate() {
    const errors = [];
    if (!this.dashboardState) {
      errors.push('Dashboard state failed to load');
    }
    return errors;
  }

  async sync() {
    this.dashboardState.lastUpdated = new Date().toISOString();
    await dashboardStore.save(this.dashboardState);
    await this.dashboardService.sync();
  }

  async recover() {
    await this.dashboardService.recover();
    this.dashboardState = {
      guildId: null,
      channelId: null,
      messageId: null,
      currentPage: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    await dashboardStore.save(this.dashboardState);
  }
}

module.exports = DashboardManager;
