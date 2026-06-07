const { loadTeams } = require('./teams');
const { loadSettings } = require('./settings');

/**
 * Find all managers and assistant managers for all teams
 * @param {Guild} guild - Discord guild
 * @returns {Promise<Object>} Leadership structure by team
 */
async function scanLeadership(guild) {
  try {
    const settings = await loadSettings();
    const teams = await loadTeams();
    const leadership = {};
    const conflicts = [];

    for (const team of teams) {
      leadership[team.teamName] = {
        teamName: team.teamName,
        teamCode: team.teamCode,
        managers: [],
        assistants: [],
        status: null,
        statusIndicator: '⚪',
        lastUpdated: new Date().toISOString(),
      };
    }

    // Fetch guild members
    const allMembers = await guild.members.fetch({ limit: 1000 }).catch(() => []);

    // Find manager role
    const managerRole = guild.roles.cache.find((role) => role.name === settings.managerRoleNames?.[0] || 'RSA | Managers');
    const assistantRole = guild.roles.cache.find((role) => role.name === settings.assistantManagerRoleNames?.[0] || 'RSA | Assistant Managers');

    if (!managerRole || !assistantRole) {
      console.warn('Manager or Assistant Manager roles not found in guild');
      return leadership;
    }

    // Scan all members for leadership roles
    for (const member of allMembers.values()) {
      // Check if member is a manager
      if (member.roles.cache.has(managerRole.id)) {
        const teamRoles = member.roles.cache.filter((role) => {
          const isTeamRole = teams.some((t) => t.roleId === role.id);
          return isTeamRole;
        });

        if (teamRoles.size > 1) {
          // Multiple team roles = conflict
          conflicts.push({
            type: 'multipleTeamsManager',
            member: member,
            teams: teamRoles.map((r) => {
              const team = teams.find((t) => t.roleId === r.id);
              return team?.teamName || 'Unknown';
            }),
            timestamp: new Date().toISOString(),
          });
        }

        for (const teamRole of teamRoles.values()) {
          const team = teams.find((t) => t.roleId === teamRole.id);
          if (team && leadership[team.teamName]) {
            leadership[team.teamName].managers.push({
              userId: member.id,
              username: member.user.username,
              displayName: member.displayName,
              mention: member.toString(),
            });
          }
        }
      }

      // Check if member is an assistant manager
      if (member.roles.cache.has(assistantRole.id)) {
        const teamRoles = member.roles.cache.filter((role) => {
          const isTeamRole = teams.some((t) => t.roleId === role.id);
          return isTeamRole;
        });

        if (teamRoles.size > 1) {
          // Multiple team roles = conflict
          conflicts.push({
            type: 'multipleTeamsAssistant',
            member: member,
            teams: teamRoles.map((r) => {
              const team = teams.find((t) => t.roleId === r.id);
              return team?.teamName || 'Unknown';
            }),
            timestamp: new Date().toISOString(),
          });
        }

        for (const teamRole of teamRoles.values()) {
          const team = teams.find((t) => t.roleId === teamRole.id);
          if (team && leadership[team.teamName]) {
            leadership[team.teamName].assistants.push({
              userId: member.id,
              username: member.user.username,
              displayName: member.displayName,
              mention: member.toString(),
            });
          }
        }
      }
    }

    // Determine status for each team
    for (const teamName in leadership) {
      const team = leadership[teamName];
      const managerCount = team.managers.length;
      const assistantCount = team.assistants.length;

      if (managerCount > 1) {
        team.status = 'Multiple Managers Detected';
        team.statusIndicator = '🟠';
      } else if (assistantCount > 1) {
        team.status = 'Multiple Assistants Detected';
        team.statusIndicator = '🟠';
      } else if (managerCount === 0) {
        team.status = 'Vacant Team';
        team.statusIndicator = '🔴';
      } else if (assistantCount === 0) {
        team.status = 'Assistant Needed';
        team.statusIndicator = '🟡';
      } else {
        team.status = 'Fully Staffed';
        team.statusIndicator = '🟢';
      }
    }

    return { leadership, conflicts };
  } catch (error) {
    console.error('Error scanning leadership:', error);
    return { leadership: {}, conflicts: [] };
  }
}

/**
 * Get a summary of leadership statistics
 * @param {Object} leadership - Leadership structure from scanLeadership
 * @returns {Object} Statistics
 */
function getLeadershipStats(leadership) {
  let totalTeams = 0;
  let activeManagers = new Set();
  let activeAssistants = new Set();
  let vacantTeams = 0;
  let teamsNeedingAssistants = 0;
  let activeConflicts = 0;

  for (const teamName in leadership) {
    const team = leadership[teamName];
    totalTeams++;

    team.managers.forEach((m) => activeManagers.add(m.userId));
    team.assistants.forEach((a) => activeAssistants.add(a.userId));

    if (team.statusIndicator === '🔴') vacantTeams++;
    if (team.statusIndicator === '🟡') teamsNeedingAssistants++;
    if (team.statusIndicator === '🟠') activeConflicts++;
  }

  return {
    totalTeams,
    activeManagers: activeManagers.size,
    activeAssistants: activeAssistants.size,
    vacantTeams,
    teamsNeedingAssistants,
    activeConflicts,
  };
}

module.exports = {
  scanLeadership,
  getLeadershipStats,
};
