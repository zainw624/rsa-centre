const staffStore = require('../storage/StaffStore');
const { scanLeadership } = require('../utils/leadership');
const { loadSettings } = require('../utils/settings');

class ManagerManager {
  constructor(client = null) {
    this.client = client;
    this.staff = {
      managers: [],
      assistants: [],
      staffAudit: [],
      leadership: {},
      lastSyncedAt: null,
    };
    this.leadership = {};
    this.conflicts = [];
  }

  async initialize(client = null) {
    if (client) {
      this.client = client;
    }

    this.staff = await staffStore.load();
    this.staff.managers = Array.isArray(this.staff.managers) ? this.staff.managers : [];
    this.staff.assistants = Array.isArray(this.staff.assistants) ? this.staff.assistants : [];
    this.staff.staffAudit = Array.isArray(this.staff.staffAudit) ? this.staff.staffAudit : [];
    this.staff.leadership = this.staff.leadership || {};
    this.staff.lastSyncedAt = this.staff.lastSyncedAt || null;
    this.leadership = this.staff.leadership;
  }

  async validateManagers() {
    const issues = [];
    if (!Array.isArray(this.staff.managers)) {
      issues.push('Stored managers list must be an array');
    }
    if (!Array.isArray(this.staff.assistants)) {
      issues.push('Stored assistants list must be an array');
    }
    if (!Array.isArray(this.staff.staffAudit)) {
      issues.push('Stored staffAudit list must be an array');
    }
    if (typeof this.staff.leadership !== 'object' || this.staff.leadership === null) {
      issues.push('Stored leadership snapshot must be an object');
    }
    return issues;
  }

  async syncGuildLeadership(guild) {
    if (!guild) {
      throw new Error('Guild is required to synchronize manager leadership');
    }

    const settings = await loadSettings();
    if (!settings) {
      throw new Error('Failed to load settings for manager synchronization');
    }

    const { leadership, conflicts } = await scanLeadership(guild);
    this.leadership[guild.id] = leadership;
    this.conflicts = conflicts;

    const managers = [];
    for (const teamName in leadership) {
      const team = leadership[teamName];
      for (const manager of team.managers) {
        managers.push({
          ...manager,
          teamName: team.teamName,
          teamCode: team.teamCode,
          status: team.status,
        });
      }
    }

    this.staff.managers = managers;
    this.staff.leadership = this.leadership;
    this.staff.lastSyncedAt = new Date().toISOString();

    await staffStore.save(this.staff);

    return { leadership, conflicts };
  }

  async syncAllGuilds() {
    if (!this.client) {
      throw new Error('Client instance is required to synchronize all guilds');
    }

    const guilds = Array.from(this.client.guilds.cache.values());
    const results = [];
    for (const guild of guilds) {
      try {
        results.push(await this.syncGuildLeadership(guild));
      } catch (error) {
        console.warn(`⚠️ Failed to sync manager leadership for guild ${guild.id}: ${error.message}`);
      }
    }
    return results;
  }

  async handleMemberRoleChange(oldMember, newMember) {
    if (!oldMember || !newMember || oldMember.guild.id !== newMember.guild.id) {
      return;
    }

    const oldRoleIds = new Set(oldMember.roles.cache.map((role) => role.id));
    const newRoleIds = new Set(newMember.roles.cache.map((role) => role.id));
    const addedRoleIds = [...newRoleIds].filter((id) => !oldRoleIds.has(id));
    const removedRoleIds = [...oldRoleIds].filter((id) => !newRoleIds.has(id));

    if (addedRoleIds.length === 0 && removedRoleIds.length === 0) {
      return;
    }

    await this.syncGuildLeadership(newMember.guild);
  }
}

module.exports = ManagerManager;
