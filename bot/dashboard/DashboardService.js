class DashboardService {
  constructor() {
    this.state = {
      initialized: false,
      dashboardId: null,
      channelId: null,
      createdAt: null,
      lastSyncedAt: null,
    };
  }

  async initialize() {
    this.state.initialized = true;
    this.state.createdAt = this.state.createdAt || new Date().toISOString();
  }

  async validate() {
    const errors = [];
    if (!this.state.channelId) {
      errors.push('Dashboard channelId is required');
    }
    if (!this.state.dashboardId) {
      errors.push('Dashboard messageId is required');
    }
    return errors;
  }

  async sync() {
    this.state.lastSyncedAt = new Date().toISOString();
    return this.state;
  }

  async recover() {
    this.state.dashboardId = null;
    this.state.channelId = null;
    this.state.lastSyncedAt = new Date().toISOString();
  }
}

module.exports = DashboardService;
