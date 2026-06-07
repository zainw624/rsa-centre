const operationsCenterStore = require('../storage/OperationsCenterStore');
const {
  buildDashboardPage,
  buildTeamsPage,
  buildManagersPage,
  buildStaffPage,
  buildRostersPage,
  buildTransfersPage,
  buildDisciplinePage,
  buildFixturesPage,
  buildResultsPage,
  buildWorldCupPage,
  buildStatisticsPage,
  buildCompliancePage,
  buildActivityPage,
  buildSystemPage,
  buildNavigationButtons,
} = require('../utils/operationsCenter');

const PAGE_COUNT = 14; // Total number of pages

class OperationsCenter {
  constructor() {
    this.state = null;
    this.currentPage = 0;
    this.activities = [];
    this.autoSyncInterval = null;
  }

  async initialize() {
    try {
      this.state = await operationsCenterStore.load();
      this.currentPage = this.state.currentPage || 0;
      return this.state;
    } catch (error) {
      console.error('[Operations Centre] Initialization error:', error);
      throw error;
    }
  }

  async sync() {
    try {
      if (this.state) {
        this.state.lastUpdated = new Date().toISOString();
        this.state.currentPage = this.currentPage;
        await operationsCenterStore.save(this.state);
      }
    } catch (error) {
      console.error('[Operations Centre] Sync error:', error);
    }
  }

  setDashboardInfo(guildId, channelId, messageId) {
    if (!this.state) {
      this.state = { 
        guildId, 
        channelId, 
        messageId, 
        currentPage: 0, 
        lastUpdated: new Date().toISOString(), 
        createdAt: new Date().toISOString() 
      };
    } else {
      this.state.guildId = guildId;
      this.state.channelId = channelId;
      this.state.messageId = messageId;
    }
    return this.sync();
  }

  async buildPage(pageIndex, client) {
    try {
      const pages = [
        () => this.buildDashboardPageContent(client),
        () => this.buildTeamsPageContent(client),
        () => this.buildManagersPageContent(client),
        () => this.buildStaffPageContent(client),
        () => this.buildRostersPageContent(client),
        () => this.buildTransfersPageContent(client),
        () => this.buildDisciplinePageContent(client),
        () => this.buildFixturesPageContent(client),
        () => this.buildResultsPageContent(client),
        () => this.buildWorldCupPageContent(client),
        () => this.buildStatisticsPageContent(client),
        () => this.buildCompliancePageContent(client),
        () => this.buildActivityPageContent(client),
        () => this.buildSystemPageContent(client),
      ];

      if (pageIndex >= 0 && pageIndex < pages.length) {
        return pages[pageIndex]();
      }

      return pages[0]();
    } catch (error) {
      console.error(`[Operations Centre] Error building page ${pageIndex}:`, error);
      return buildDashboardPage({ teamCount: 0, managerCount: 0, playerCount: 0, recentActivity: '⚠️ Error loading page' });
    }
  }

  buildDashboardPageContent(client) {
    try {
      const teamCount = client.leagueMonitor?.getTeams?.()?.length || 0;
      const allStaff = client.leagueMonitor?.getAllStaff?.() || {};
      const managerCount = (allStaff.managers || []).length;
      const playerCount = client.leagueMonitor?.getTeams?.()?.reduce?.((sum, t) => sum + (t.rosterPlayers?.length || 0), 0) || 0;

      const recentActivity = this.activities
        .slice(0, 3)
        .map((a) => `• ${a.text}`)
        .join('\n') || 'System running normally';

      return buildDashboardPage({ teamCount, managerCount, playerCount, recentActivity });
    } catch (error) {
      console.error('[Operations Centre] Error building dashboard page:', error);
      return buildDashboardPage({ teamCount: 0, managerCount: 0, playerCount: 0, recentActivity: '⚠️ Service error' });
    }
  }

  buildTeamsPageContent(client) {
    try {
      const teams = client.leagueMonitor?.getTeams?.() || [];
      return buildTeamsPage(teams);
    } catch (error) {
      console.error('[Operations Centre] Error building teams page:', error);
      return buildTeamsPage([]);
    }
  }

  buildManagersPageContent(client) {
    try {
      const leadership = client.managersDashboard?.getLeadership?.() || {};
      return buildManagersPage(leadership);
    } catch (error) {
      console.error('[Operations Centre] Error building managers page:', error);
      return buildManagersPage({});
    }
  }

  buildStaffPageContent(client) {
    try {
      const staff = client.leagueMonitor?.getAllStaff?.() || { managers: [], assistants: [] };
      return buildStaffPage(staff);
    } catch (error) {
      console.error('[Operations Centre] Error building staff page:', error);
      return buildStaffPage({ managers: [], assistants: [] });
    }
  }

  buildRostersPageContent(client) {
    try {
      const teams = client.leagueMonitor?.getTeams?.() || [];
      return buildRostersPage(teams);
    } catch (error) {
      console.error('[Operations Centre] Error building rosters page:', error);
      return buildRostersPage([]);
    }
  }

  buildTransfersPageContent(client) {
    try {
      const transfers = client.transferManager?.getAllTransfers?.() || [];
      return buildTransfersPage(transfers);
    } catch (error) {
      console.error('[Operations Centre] Error building transfers page:', error);
      return buildTransfersPage([]);
    }
  }

  buildDisciplinePageContent(client) {
    try {
      // Safely access discipline violations
      const violations = client.complianceEngine?.violations || [];
      return buildDisciplinePage(violations);
    } catch (error) {
      console.error('[Operations Centre] Error building discipline page:', error);
      return buildDisciplinePage([]);
    }
  }

  buildFixturesPageContent(client) {
    try {
      const fixtures = client.fixtureManager?.getFixtures?.() || [];
      return buildFixturesPage(fixtures);
    } catch (error) {
      console.error('[Operations Centre] Error building fixtures page:', error);
      return buildFixturesPage([]);
    }
  }

  buildResultsPageContent(client) {
    try {
      const results = client.resultsManager?.getAllResults?.() || [];
      return buildResultsPage(results);
    } catch (error) {
      console.error('[Operations Centre] Error building results page:', error);
      return buildResultsPage([]);
    }
  }

  buildWorldCupPageContent(client) {
    try {
      const settings = client.leagueMonitor?.settings || {};
      return buildWorldCupPage(settings);
    } catch (error) {
      console.error('[Operations Centre] Error building world cup page:', error);
      return buildWorldCupPage({});
    }
  }

  buildStatisticsPageContent(client) {
    try {
      const teams = client.leagueMonitor?.getTeams?.() || [];
      const matches = client.fixtureManager?.getFixtures?.()?.length || 0;
      const results = client.resultsManager?.getAllResults?.() || [];
      const goals = results.reduce((sum, r) => sum + (r.homeScore || 0) + (r.awayScore || 0), 0);

      const stats = {
        teams: teams.length,
        players: teams.reduce((sum, t) => sum + (t.rosterPlayers?.length || 0), 0),
        matches,
        goals,
      };

      return buildStatisticsPage(stats);
    } catch (error) {
      console.error('[Operations Centre] Error building statistics page:', error);
      return buildStatisticsPage({ teams: 0, players: 0, matches: 0, goals: 0 });
    }
  }

  buildCompliancePageContent(client) {
    try {
      const compliance = client.complianceEngine || {};
      return buildCompliancePage(compliance);
    } catch (error) {
      console.error('[Operations Centre] Error building compliance page:', error);
      return buildCompliancePage({});
    }
  }

  buildActivityPageContent(client) {
    try {
      return buildActivityPage(this.activities);
    } catch (error) {
      console.error('[Operations Centre] Error building activity page:', error);
      return buildActivityPage([]);
    }
  }

  buildSystemPageContent(client) {
    try {
      return buildSystemPage(client.leagueMonitor);
    } catch (error) {
      console.error('[Operations Centre] Error building system page:', error);
      return buildSystemPage(null);
    }
  }

  getNavigationButtons(pageIndex) {
    try {
      // Ensure pageIndex is valid
      const validIndex = Math.max(0, Math.min(pageIndex, PAGE_COUNT - 1));
      return buildNavigationButtons(validIndex);
    } catch (error) {
      console.error('[Operations Centre] Error building navigation buttons:', error);
      return buildNavigationButtons(0);
    }
  }

  async changePage(newPageIndex) {
    if (newPageIndex >= 0 && newPageIndex < PAGE_COUNT) {
      this.currentPage = newPageIndex;
      await this.sync();
      return true;
    }
    return false;
  }

  logActivity(text) {
    try {
      const timestamp = new Date().toISOString();
      this.activities.unshift({ text, timestamp });
      // Keep last 50 activities
      if (this.activities.length > 50) {
        this.activities.pop();
      }
    } catch (error) {
      console.error('[Operations Centre] Error logging activity:', error);
    }
  }

  getDashboardInfo() {
    return {
      guildId: this.state?.guildId || null,
      channelId: this.state?.channelId || null,
      messageId: this.state?.messageId || null,
    };
  }

  getCurrentPage() {
    return this.currentPage;
  }

  getPageCount() {
    return PAGE_COUNT;
  }
}

module.exports = OperationsCenter;
