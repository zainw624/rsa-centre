const { loadSettings } = require('../utils/settings');

class ComplianceManager {
  async initialize() {
    this.rules = [];
  }

  async runComplianceChecks(context) {
    const issues = [];
    if (!context) {
      issues.push('Compliance context is required');
      return issues;
    }

    if (!Array.isArray(context.teams)) {
      issues.push('Compliance context must include team definitions');
    }

    const settings = context.settings || (await loadSettings());
    const teams = Array.isArray(context.teams) ? context.teams : [];
    const guilds = Array.isArray(context.guilds) ? context.guilds : [];
    const transfers = Array.isArray(context.transfers) ? context.transfers : [];

    if (guilds.length === 0) {
      issues.push('Compliance context must include at least one guild');
    }

    for (const guild of guilds) {
      await guild.members.fetch().catch(() => null);
      const cupTiedRole = guild.roles.cache.get(settings.cupTiedRoleId) || null;
      const sanctionedRole = guild.roles.cache.get(settings.sanctionedRoleId) || null;
      const teamRoleIds = teams.map((team) => team.roleId).filter(Boolean);

      for (const member of guild.members.cache.values()) {
        if (cupTiedRole && member.roles.cache.has(cupTiedRole.id)) {
          for (const teamRoleId of teamRoleIds) {
            if (member.roles.cache.has(teamRoleId)) {
              const role = guild.roles.cache.get(teamRoleId);
              issues.push(`Cup Tied player ${member.user.tag} still holds team role ${role ? role.name : teamRoleId}`);
            }
          }
        }

        if (sanctionedRole && member.roles.cache.has(sanctionedRole.id)) {
          for (const teamRoleId of teamRoleIds) {
            if (member.roles.cache.has(teamRoleId)) {
              const role = guild.roles.cache.get(teamRoleId);
              issues.push(`Sanctioned player ${member.user.tag} still holds team role ${role ? role.name : teamRoleId}`);
            }
          }
        }
      }

      for (const team of teams) {
        const rosterPlayers = Array.isArray(team.rosterPlayers) ? team.rosterPlayers : [];
        for (const rosterEntry of rosterPlayers) {
          const member = guild.members.cache.get(rosterEntry.playerId);
          if (!member) continue;
          if (cupTiedRole && member.roles.cache.has(cupTiedRole.id)) {
            issues.push(`Cup Tied player ${member.user.tag} remains rostered for ${team.teamName}`);
          }
          if (sanctionedRole && member.roles.cache.has(sanctionedRole.id)) {
            issues.push(`Sanctioned player ${member.user.tag} remains rostered for ${team.teamName}`);
          }
        }
      }

      for (const transfer of transfers) {
        if (transfer.type === 'sign' || transfer.type === 'release') {
          const playerId = transfer.playerId;
          const member = guild.members.cache.get(playerId);
          if (!member) continue;
          if (cupTiedRole && member.roles.cache.has(cupTiedRole.id)) {
            issues.push(`Transfer ${transfer.id} involves Cup Tied player ${member.user.tag}`);
          }
          if (sanctionedRole && member.roles.cache.has(sanctionedRole.id)) {
            issues.push(`Transfer ${transfer.id} involves sanctioned player ${member.user.tag}`);
          }
        }
      }
    }

    return issues;
  }

  async reportIssues(issues) {
    return issues.map((issue) => ({ issue, timestamp: new Date().toISOString() }));
  }
}

module.exports = ComplianceManager;
