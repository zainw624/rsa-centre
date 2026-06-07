const managersDashboardStore = require('../storage/ManagersDashboardStore');
const { scanLeadership } = require('../utils/leadership');

class ManagersDashboard {
  constructor() {
    this.guildId = null;
    this.channelId = null;
    this.messageId = null;
    this.teamCards = {};
    this.lastUpdated = null;
    this.createdAt = null;
    this.leadership = {};
  }

  async initialize() {
    const data = await managersDashboardStore.load();
    this.guildId = data.guildId;
    this.channelId = data.channelId;
    this.messageId = data.messageId;
    this.teamCards = data.teamCards || {};
    this.lastUpdated = data.lastUpdated;
    this.createdAt = data.createdAt;
  }

  async sync() {
    await managersDashboardStore.save({
      guildId: this.guildId,
      channelId: this.channelId,
      messageId: this.messageId,
      teamCards: this.teamCards,
      lastUpdated: this.lastUpdated,
      createdAt: this.createdAt,
    });
  }

  async updateLeadership(guild) {
    if (!guild) return null;

    try {
      const { leadership, conflicts } = await scanLeadership(guild);
      this.leadership = leadership;
      this.lastUpdated = new Date().toISOString();
      await this.sync();
      return { leadership, conflicts };
    } catch (error) {
      console.error('Error updating leadership:', error);
      return null;
    }
  }

  getLeadership() {
    return this.leadership;
  }

  getTeamLeadership(teamName) {
    return this.leadership[teamName] || null;
  }

  getAllTeams() {
    return Object.values(this.leadership);
  }

  getTeamsByStatus(status) {
    return Object.values(this.leadership).filter((team) => team.status === status);
  }

  getVacantTeams() {
    return this.getTeamsByStatus('Vacant Team');
  }

  getTeamsNeedingAssistants() {
    return this.getTeamsByStatus('Assistant Needed');
  }

  getFullyStaffedTeams() {
    return this.getTeamsByStatus('Fully Staffed');
  }

  getSummary() {
    const teams = Object.values(this.leadership);
    const summary = {
      totalTeams: teams.length,
      fullyStaffed: 0,
      needingAssistants: 0,
      vacant: 0,
      multipleManagers: 0,
      totalManagers: new Set(),
      totalAssistants: new Set(),
      lastUpdated: this.lastUpdated,
    };

    for (const team of teams) {
      if (team.status === 'Fully Staffed') {
        summary.fullyStaffed++;
      } else if (team.status === 'Assistant Needed') {
        summary.needingAssistants++;
      } else if (team.status === 'Vacant Team') {
        summary.vacant++;
      } else if (team.status.includes('Multiple')) {
        summary.multipleManagers++;
      }

      for (const manager of team.managers) {
        summary.totalManagers.add(manager.userId);
      }
      for (const assistant of team.assistants) {
        summary.totalAssistants.add(assistant.userId);
      }
    }

    return {
      ...summary,
      totalManagers: summary.totalManagers.size,
      totalAssistants: summary.totalAssistants.size,
    };
  }

  hasChanges(newLeadership) {
    if (!this.leadership || Object.keys(this.leadership).length === 0) {
      return true;
    }

    for (const teamName in newLeadership) {
      const oldTeam = this.leadership[teamName];
      const newTeam = newLeadership[teamName];

      if (!oldTeam) return true;

      // Check manager changes
      if (oldTeam.managers.length !== newTeam.managers.length) return true;
      for (let i = 0; i < oldTeam.managers.length; i++) {
        if (oldTeam.managers[i].userId !== newTeam.managers[i].userId) return true;
      }

      // Check assistant changes
      if (oldTeam.assistants.length !== newTeam.assistants.length) return true;
      for (let i = 0; i < oldTeam.assistants.length; i++) {
        if (oldTeam.assistants[i].userId !== newTeam.assistants[i].userId) return true;
      }

      // Check status changes
      if (oldTeam.status !== newTeam.status) return true;
    }

    return false;
  }

  setDashboardInfo(guildId, channelId, messageId) {
    this.guildId = guildId;
    this.channelId = channelId;
    this.messageId = messageId;
    this.createdAt = new Date().toISOString();
    this.lastUpdated = new Date().toISOString();
  }
}

module.exports = ManagersDashboard;
