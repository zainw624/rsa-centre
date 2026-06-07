const ConfigLoader = require('../config/configLoader');
const TeamManager = require('./TeamManager');
const StaffManager = require('./StaffManager');
const ManagerManager = require('./ManagerManager');
const AssistantManager = require('./AssistantManager');
const StaffCentreManager = require('./StaffCentreManager');
const TransferManager = require('./TransferManager');
const FixtureManager = require('./FixtureManager');
const ComplianceManager = require('./ComplianceManager');
const DashboardManager = require('./DashboardManager');
const DashboardService = require('../dashboard/DashboardService');
const { loadSettings } = require('../utils/settings');

class LeagueMonitor {
  constructor(client) {
    this.client = client;
    this.configLoader = ConfigLoader;
    this.teamManager = new TeamManager();
    this.staffManager = new StaffManager();
    this.managerManager = new ManagerManager(client);
    this.assistantManager = new AssistantManager(client);
    this.staffCentreManager = new StaffCentreManager(client);
    this.transferManager = new TransferManager();
    this.fixtureManager = new FixtureManager();
    this.complianceManager = new ComplianceManager();
    this.dashboardManager = new DashboardManager(new DashboardService());
    this.transferWindowOpen = null;
    this.startedAt = null;
  }

  async refreshTransferWindow() {
    const settings = await loadSettings();
    this.transferWindowOpen = settings.transferWindowOpen === true;
    return this.transferWindowOpen;
  }

  async initialize() {
    await this.configLoader.load();
    const validationErrors = this.configLoader.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Startup validation failed: ${validationErrors.join('; ')}`);
    }

    await Promise.all([
      this.teamManager.initialize(),
      this.staffManager.initialize(),
      this.managerManager.initialize(this.client),
      this.assistantManager.initialize(this.client),
      this.staffCentreManager.initialize(this.client),
      this.transferManager.initialize(),
      this.fixtureManager.initialize(),
      this.dashboardManager.initialize(),
    ]);

    await this.refreshTransferWindow();

    await Promise.all([
      this.managerManager.syncAllGuilds(),
      this.assistantManager.syncAllGuilds(),
      this.staffCentreManager.syncAllGuilds(),
    ]);

    const issues = [
      ...(await this.teamManager.validateTeams()),
      ...(await this.staffManager.validateStaff()),
      ...(await this.managerManager.validateManagers()),
      ...(await this.assistantManager.validateAssistants()),
      ...(await this.staffCentreManager.validateStaffCentre()),
      ...(await this.transferManager.validateTransfers()),
      ...(await this.fixtureManager.validateFixtures()),
      ...(await this.dashboardManager.validate()),
    ];

    if (issues.length > 0) {
      throw new Error(`League monitor detected issues during startup: ${issues.join('; ')}`);
    }

    this.startedAt = new Date();
    return this;
  }

  async start() {
    await this.initialize();
  }

  async recover() {
    await this.dashboardManager.recover();
  }

  async runCompliance() {
    const settings = await loadSettings();
    const guilds = Array.from(this.client.guilds.cache.values());
    const context = {
      teams: this.teamManager.teams,
      staff: this.staffManager.staff,
      managers: this.managerManager.staff.managers,
      assistants: this.assistantManager.staff.assistants,
      staffCentre: this.staffCentreManager.staffSnapshot,
      leadership: this.assistantManager.leadership,
      transfers: this.transferManager.transfers,
      fixtures: this.fixtureManager.fixtures,
      settings,
      guilds,
    };
    const issues = await this.complianceManager.runComplianceChecks(context);
    return this.complianceManager.reportIssues(issues);
  }
}

module.exports = LeagueMonitor;
