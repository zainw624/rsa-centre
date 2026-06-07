const fs = require('fs').promises;
const path = require('path');
const { readJSON, writeJSON } = require('./storage');
const { loadSettings } = require('./settings');

const TEAMS_PATH = path.join(__dirname, '..', 'data', 'teams.json');
const ASSETS_PATH = path.join(__dirname, '..', 'assets');
const DEFAULT_LOGO_PATH = path.join(ASSETS_PATH, 'rsa.png');

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function normalizeTeams(teams) {
  let changed = false;
  for (const team of teams) {
    if (!team.teamId) {
      team.teamId = slugify(team.teamName || team.teamCode || `team-${Math.random().toString(36).slice(2, 8)}`);
      changed = true;
    }
    if (!team.logo) {
      team.logo = `assets/${slugify(team.teamName || team.teamCode)}.png`;
      changed = true;
    }
    if (typeof team.rosterPlayers === 'undefined') {
      team.rosterPlayers = [];
      changed = true;
    }
    if (typeof team.rosterLimit !== 'number') {
      team.rosterLimit = 16;
      changed = true;
    }
  }
  return { teams, changed };
}

function resolveTeamIdentifier(team, identifier) {
  if (!identifier || !team) return false;
  const normalized = identifier.toString().trim();
  return (
    team.teamId === normalized ||
    team.teamName === normalized ||
    team.teamCode === normalized ||
    team.roleId === normalized
  );
}

async function loadTeams() {
  const data = await readJSON(TEAMS_PATH, { teams: [] });
  const teams = data.teams || [];
  const normalized = await normalizeTeams(teams);
  if (normalized.changed) {
    await saveTeams(normalized.teams);
  }
  return normalized.teams;
}

async function saveTeams(teams) {
  await writeJSON(TEAMS_PATH, { teams });
}

async function getTeamById(teamId) {
  const teams = await loadTeams();
  return teams.find((team) => team.teamId === teamId);
}

async function getTeamByName(teamName) {
  const teams = await loadTeams();
  return teams.find((team) => team.teamName === teamName);
}

async function getTeamByCode(teamCode) {
  const teams = await loadTeams();
  return teams.find((team) => team.teamCode === teamCode);
}

async function getTeamByReference(identifier, guild = null) {
  const teams = await loadTeams();
  let team = teams.find((entry) => resolveTeamIdentifier(entry, identifier));

  if (!team && guild && typeof identifier === 'string') {
    const role = guild.roles.cache.find((role) => role.name === identifier);
    if (role) {
      team = teams.find((entry) => resolveTeamIdentifier(entry, role.id));
    }
  }

  if (!team && guild && identifier && typeof identifier === 'string') {
    const role = guild.roles.cache.get(identifier);
    if (role) {
      team = teams.find((entry) => resolveTeamIdentifier(entry, role.id));
    }
  }

  return team || null;
}

async function getTeamByRoleId(roleId, guild = null) {
  const teams = await loadTeams();
  const teamByRoleId = teams.find((team) => team.roleId === roleId);
  if (teamByRoleId) return teamByRoleId;
  if (guild) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      return teams.find((team) => team.teamName === role.name || team.teamCode === role.name || team.teamId === role.name);
    }
  }
  return null;
}

function resolveTeamRole(guild, team) {
  if (!team) return null;
  if (team.roleId) {
    const role = guild.roles.cache.get(team.roleId);
    if (role) return role;
  }
  return guild.roles.cache.find((role) => role.name === team.teamName || role.name === team.teamCode);
}

function getLogoPathForTeam(team) {
  if (!team) return DEFAULT_LOGO_PATH;
  const logoPath = path.isAbsolute(team.logo) ? team.logo : path.join(__dirname, '..', team.logo);
  return fs.access(logoPath)
    .then(() => logoPath)
    .catch(() => DEFAULT_LOGO_PATH);
}

async function validateTeamConfig() {
  const teams = await loadTeams();
  const errors = [];
  if (!Array.isArray(teams)) {
    errors.push('Teams config must be an array');
    return errors;
  }
  const teamIds = new Set();
  const teamCodes = new Set();
  const teamNames = new Set();
  for (const team of teams) {
    if (!team.teamId) errors.push(`Team entry is missing teamId: ${JSON.stringify(team)}`);
    if (!team.teamName) errors.push(`Team entry is missing teamName: ${team.teamId || JSON.stringify(team)}`);
    if (!team.teamCode) errors.push(`Team entry is missing teamCode: ${team.teamName || team.teamId}`);
    if (teamIds.has(team.teamId)) errors.push(`Duplicate teamId: ${team.teamId}`);
    if (teamCodes.has(team.teamCode)) errors.push(`Duplicate teamCode: ${team.teamCode}`);
    if (teamNames.has(team.teamName)) errors.push(`Duplicate teamName: ${team.teamName}`);
    teamIds.add(team.teamId);
    teamCodes.add(team.teamCode);
    teamNames.add(team.teamName);
    if (typeof team.rosterLimit !== 'number' || team.rosterLimit <= 0) {
      errors.push(`Invalid rosterLimit for ${team.teamName}`);
    }
  }
  return errors;
}

async function addTeam(teamData) {
  const teams = await loadTeams();
  const teamId = teamData.teamId || slugify(teamData.teamName || teamData.teamCode);
  if (!teamId || !teamData.teamName || !teamData.teamCode) {
    throw new Error('Team must include teamId, teamName, and teamCode');
  }
  if (teams.some((team) => resolveTeamIdentifier(team, teamId))) {
    throw new Error(`A team with the same identifier already exists: ${teamId}`);
  }
  if (teams.some((team) => team.teamCode === teamData.teamCode)) {
    throw new Error(`A team with code ${teamData.teamCode} already exists`);
  }
  if (teams.some((team) => team.teamName === teamData.teamName)) {
    throw new Error(`A team with name ${teamData.teamName} already exists`);
  }

  const newTeam = {
    teamId,
    teamName: teamData.teamName,
    teamCode: teamData.teamCode,
    roleId: teamData.roleId || '',
    coachDiscordId: teamData.coachDiscordId || '',
    logo: teamData.logo || `assets/${slugify(teamData.teamName)}.png`,
    rosterLimit: Number(teamData.rosterLimit) || 16,
    rosterPlayers: [],
  };

  teams.push(newTeam);
  await saveTeams(teams);
  return newTeam;
}

async function removeTeam(identifier) {
  const teams = await loadTeams();
  const team = await getTeamByReference(identifier);
  if (!team) throw new Error(`Team not found for identifier ${identifier}`);
  const filtered = teams.filter((entry) => entry.teamId !== team.teamId);
  await saveTeams(filtered);
  return team;
}

async function renameTeam(identifier, newName, newCode = null) {
  if (!newName) throw new Error('New team name is required');
  const teams = await loadTeams();
  const team = await getTeamByReference(identifier);
  if (!team) throw new Error(`Team not found for identifier ${identifier}`);
  if (teams.some((entry) => entry.teamName === newName && entry.teamId !== team.teamId)) {
    throw new Error(`A team already exists with the name ${newName}`);
  }
  team.teamName = newName;
  if (newCode) {
    if (teams.some((entry) => entry.teamCode === newCode && entry.teamId !== team.teamId)) {
      throw new Error(`A team already exists with the code ${newCode}`);
    }
    team.teamCode = newCode;
  }
  await saveTeams(teams);
  return team;
}

async function replaceTeamLogo(identifier, logoPath) {
  if (!logoPath) throw new Error('Logo path is required');
  const teams = await loadTeams();
  const team = await getTeamByReference(identifier);
  if (!team) throw new Error(`Team not found for identifier ${identifier}`);
  team.logo = logoPath;
  await saveTeams(teams);
  return team;
}

async function getTeamForMember(member) {
  const teams = await loadTeams();
  for (const team of teams) {
    if (team.roleId && member.roles.cache.has(team.roleId)) {
      return team;
    }
    const matchingRole = member.roles.cache.find((role) => role.name === team.teamName || role.name === team.teamCode || role.name === team.teamId);
    if (matchingRole) {
      return team;
    }
  }
  return null;
}

async function getTeamChoices() {
  const teams = await loadTeams();
  return teams.map((team) => ({ name: team.teamName, value: team.teamId }));
}

async function addPlayerToRoster(teamName, playerId, playerName) {
  const teams = await loadTeams();
  const team = teams.find((entry) => entry.teamName === teamName);
  if (!team) {
    throw new Error(`Team "${teamName}" not found`);
  }
  if (!Array.isArray(team.rosterPlayers)) {
    team.rosterPlayers = [];
  }
  if (team.rosterPlayers.length >= team.rosterLimit) {
    throw new Error(`${team.teamName} roster is full (${team.rosterPlayers.length}/${team.rosterLimit})`);
  }
  if (team.rosterPlayers.some((player) => player.playerId === playerId)) {
    throw new Error(`${playerName} is already on ${team.teamName} roster`);
  }

  team.rosterPlayers.push({
    playerId,
    playerName,
    joinedAt: new Date().toISOString(),
  });

  await saveTeams(teams);
  return team;
}

async function removePlayerFromRoster(teamName, playerId) {
  const teams = await loadTeams();
  const team = teams.find((entry) => entry.teamName === teamName);
  if (!team) {
    throw new Error(`Team "${teamName}" not found`);
  }
  if (!Array.isArray(team.rosterPlayers)) {
    team.rosterPlayers = [];
  }

  const index = team.rosterPlayers.findIndex((player) => player.playerId === playerId);
  if (index === -1) {
    throw new Error(`Player not found on ${team.teamName} roster`);
  }

  team.rosterPlayers.splice(index, 1);
  await saveTeams(teams);
  return team;
}

async function getPlayerFromRoster(teamName, playerId) {
  const team = await getTeamByName(teamName);
  if (!team) {
    throw new Error(`Team "${teamName}" not found`);
  }
  return team.rosterPlayers.find((player) => player.playerId === playerId);
}

async function updateCoach(teamName, discordId, robloxId) {
  const teams = await loadTeams();
  const team = teams.find((entry) => entry.teamName === teamName);
  if (!team) {
    throw new Error(`Team "${teamName}" not found`);
  }
  team.coachDiscordId = discordId;
  team.coachRobloxId = robloxId;
  await saveTeams(teams);
  return team;
}

async function getRosterStats(teamName) {
  const team = await getTeamByName(teamName);
  if (!team) {
    throw new Error(`Team "${teamName}" not found`);
  }
  return {
    teamName: team.teamName,
    teamCode: team.teamCode,
    currentPlayers: team.rosterPlayers.length,
    rosterLimit: team.rosterLimit,
    availableSlots: team.rosterLimit - team.rosterPlayers.length,
    isRosterFull: team.rosterPlayers.length >= team.rosterLimit,
    coach: {
      discordId: team.coachDiscordId,
      robloxId: team.coachRobloxId,
    },
  };
}

async function getAllRosterStats() {
  const teams = await loadTeams();
  return teams.map((team) => ({
    teamName: team.teamName,
    teamCode: team.teamCode,
    currentPlayers: team.rosterPlayers.length,
    rosterLimit: team.rosterLimit,
    availableSlots: team.rosterLimit - team.rosterPlayers.length,
    isRosterFull: team.rosterPlayers.length >= team.rosterLimit,
  }));
}

async function clearRoster(teamName) {
  const teams = await loadTeams();
  const team = teams.find((entry) => entry.teamName === teamName);
  if (!team) {
    throw new Error(`Team "${teamName}" not found`);
  }
  const clearedCount = team.rosterPlayers.length;
  team.rosterPlayers = [];
  await saveTeams(teams);
  return { teamName: team.teamName, clearedCount };
}

async function syncRostersFromGuildRoles(guild) {
  if (!guild) {
    throw new Error('Guild is required to synchronize rosters');
  }

  const teams = await loadTeams();
  await guild.members.fetch().catch(() => null);

  for (const team of teams) {
    const teamRole = resolveTeamRole(guild, team);
    if (!teamRole) {
      continue;
    }

    const rosterPlayers = [];
    teamRole.members.forEach((member) => {
      const existingEntry = Array.isArray(team.rosterPlayers)
        ? team.rosterPlayers.find((entry) => entry.playerId === member.id)
        : null;
      rosterPlayers.push({
        playerId: member.id,
        playerName: member.user.tag,
        joinedAt: existingEntry?.joinedAt || new Date().toISOString(),
      });
    });

    team.rosterPlayers = rosterPlayers;
  }

  await saveTeams(teams);
  return teams;
}

module.exports = {
  loadTeams,
  saveTeams,
  validateTeamConfig,
  getTeamById,
  getTeamByName,
  getTeamByCode,
  getTeamByReference,
  getTeamByRoleId,
  getLogoPathForTeam,
  resolveTeamRole,
  syncRostersFromGuildRoles,
  addPlayerToRoster,
  removePlayerFromRoster,
  getPlayerFromRoster,
  updateCoach,
  getRosterStats,
  getAllRosterStats,
  clearRoster,
  getTeamForMember,
  getTeamChoices,
  addTeam,
  removeTeam,
  renameTeam,
  replaceTeamLogo,
};
