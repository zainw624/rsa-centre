const { scanStaffCentre } = require('../utils/staffCentre');

class StaffCentreManager {
  constructor(client = null) {
    this.client = client;
    this.staffSnapshot = {};
    this.lastSyncedAt = null;
  }

  async initialize(client = null) {
    if (client) {
      this.client = client;
    }

    this.staffSnapshot = this.staffSnapshot || {};
    this.lastSyncedAt = this.lastSyncedAt || null;
  }

  async validateStaffCentre() {
    const issues = [];
    if (typeof this.staffSnapshot !== 'object' || this.staffSnapshot === null) {
      issues.push('Staff centre snapshot must be an object');
    }
    return issues;
  }

  async syncGuildStaffCentre(guild) {
    if (!guild) {
      throw new Error('Guild is required to synchronize staff centre data');
    }

    const staffGroups = await scanStaffCentre(guild);
    this.staffSnapshot[guild.id] = staffGroups;
    this.lastSyncedAt = new Date().toISOString();
    return staffGroups;
  }

  async syncAllGuilds() {
    if (!this.client) {
      throw new Error('Client instance is required to synchronize all guilds');
    }

    const guilds = Array.from(this.client.guilds.cache.values());
    const results = [];
    for (const guild of guilds) {
      try {
        results.push(await this.syncGuildStaffCentre(guild));
      } catch (error) {
        console.warn(`⚠️ Failed to sync staff centre for guild ${guild.id}: ${error.message}`);
      }
    }
    return results;
  }

  getStaffForGuild(guildId) {
    return this.staffSnapshot[guildId] || [];
  }
}

module.exports = StaffCentreManager;
