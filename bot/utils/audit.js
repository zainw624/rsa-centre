const path = require('path');
const { loadTeams, getTeamByRoleId } = require('./teams');
const { loadSettings } = require('./settings');

async function runAdvancedAudit(guild) {
  const settings = await loadSettings();
  const teams = await loadTeams();

  await guild.members.fetch();
  const cupTiedRole = guild.roles.cache.get(settings.cupTiedRoleId) || null;
  const sanctionedRole = guild.roles.cache.get(settings.sanctionedRoleId) || null;
  const teamRoleIds = teams.map((team) => team.roleId).filter(Boolean);

  const issues = {
    rosterLimitViolations: [],
    multipleNationRoles: [],
    cupTiedViolations: [],
    sanctionedOnRoster: [],
    missingRosterEntries: [],
    unauthorizedTeamAssignments: [],
    duplicateRosterEntries: [],
  };

  const rosterLookup = new Map();

  for (const team of teams) {
    const playerCounts = {};
    if (team.rosterPlayers.length > team.rosterLimit) {
      issues.rosterLimitViolations.push(`${team.teamName} has ${team.rosterPlayers.length}/${team.rosterLimit} roster players`);
    }

    for (const rosterEntry of team.rosterPlayers) {
      const id = rosterEntry.playerId;
      playerCounts[id] = (playerCounts[id] || 0) + 1;
      rosterLookup.set(`${team.roleId}:${id}`, true);
      const member = await guild.members.fetch(id).catch(() => null);

      if (!member) {
        issues.missingRosterEntries.push(`${rosterEntry.playerName} (${id}) is listed on ${team.teamName} roster but not found in server`);
        continue;
      }

      if (!member.roles.cache.has(team.roleId)) {
        issues.missingRosterEntries.push(`${member.user.tag} is on ${team.teamName} roster but lacks the team role`);
      }

      if (cupTiedRole && member.roles.cache.has(cupTiedRole.id)) {
        issues.cupTiedViolations.push(`${member.user.tag} is cup-tied and still rostered for ${team.teamName}`);
      }

      if (sanctionedRole && member.roles.cache.has(sanctionedRole.id)) {
        issues.sanctionedOnRoster.push(`${member.user.tag} is sanctioned but still rostered for ${team.teamName}`);
      }
    }

    Object.entries(playerCounts).forEach(([playerId, count]) => {
      if (count > 1) {
        issues.duplicateRosterEntries.push(`${playerId} appears ${count} times on ${team.teamName}`);
      }
    });
  }

  for (const member of guild.members.cache.values()) {
    const memberTeamRoles = member.roles.cache.filter((role) => teamRoleIds.includes(role.id));
    if (memberTeamRoles.size > 1) {
      issues.multipleNationRoles.push(`${member.user.tag} has ${memberTeamRoles.map((role) => role.name).join(', ')}`);
    }

    for (const role of memberTeamRoles.values()) {
      const team = getTeamByRoleId(role.id);
      if (!team) {
        issues.unauthorizedTeamAssignments.push(`${member.user.tag} has unknown team role ${role.name}`);
        continue;
      }

      const rosterKey = `${role.id}:${member.id}`;
      if (!rosterLookup.has(rosterKey)) {
        issues.unauthorizedTeamAssignments.push(`${member.user.tag} has ${team.teamName} role but is missing from roster`);
      }
    }
  }

  const summary = {
    rosterLimitViolations: issues.rosterLimitViolations.length,
    multipleNationRoles: issues.multipleNationRoles.length,
    cupTiedViolations: issues.cupTiedViolations.length,
    sanctionedOnRoster: issues.sanctionedOnRoster.length,
    missingRosterEntries: issues.missingRosterEntries.length,
    unauthorizedTeamAssignments: issues.unauthorizedTeamAssignments.length,
    duplicateRosterEntries: issues.duplicateRosterEntries.length,
  };

  return { issues, summary };
}

module.exports = {
  runAdvancedAudit,
};
