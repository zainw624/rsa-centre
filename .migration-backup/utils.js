/**
 * RSA Roster Management Utilities
 * Helper functions for managing teams and rosters
 */

const fs = require('fs').promises;
const path = require('path');

const TEAMS_FILE = path.join(__dirname, 'teams.json');

/**
 * Load all teams from teams.json
 */
async function loadTeams() {
  try {
    const data = await fs.readFile(TEAMS_FILE, 'utf8');
    return JSON.parse(data).teams;
  } catch (error) {
    throw new Error(`Failed to load teams: ${error.message}`);
  }
}

/**
 * Save teams to teams.json
 */
async function saveTeams(teams) {
  try {
    await fs.writeFile(TEAMS_FILE, JSON.stringify({ teams }, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to save teams: ${error.message}`);
  }
}

/**
 * Get all teams
 */
async function getAllTeams() {
  return await loadTeams();
}

/**
 * Get team by name
 */
async function getTeamByName(teamName) {
  const teams = await loadTeams();
  return teams.find(t => t.teamName === teamName);
}

/**
 * Get team by code
 */
async function getTeamByCode(teamCode) {
  const teams = await loadTeams();
  return teams.find(t => t.teamCode === teamCode);
}

/**
 * Add player to team roster
 */
async function addPlayerToRoster(teamName, playerId, playerName) {
  const teams = await loadTeams();
  const team = teams.find(t => t.teamName === teamName);

  if (!team) throw new Error(`Team "${teamName}" not found`);
  if (team.rosterPlayers.length >= team.rosterLimit) {
    throw new Error(`${teamName} roster is full (${team.rosterLimit}/16)`);
  }

  const exists = team.rosterPlayers.some(p => p.playerId === playerId);
  if (exists) throw new Error(`${playerName} is already on ${teamName} roster`);

  team.rosterPlayers.push({
    playerId,
    playerName,
    joinedAt: new Date().toISOString(),
  });

  await saveTeams(teams);
  return team;
}

/**
 * Remove player from team roster
 */
async function removePlayerFromRoster(teamName, playerId) {
  const teams = await loadTeams();
  const team = teams.find(t => t.teamName === teamName);

  if (!team) throw new Error(`Team "${teamName}" not found`);

  const index = team.rosterPlayers.findIndex(p => p.playerId === playerId);
  if (index === -1) throw new Error(`Player not found on ${teamName} roster`);

  team.rosterPlayers.splice(index, 1);
  await saveTeams(teams);
  return team;
}

/**
 * Get player from roster
 */
async function getPlayerFromRoster(teamName, playerId) {
  const team = await getTeamByName(teamName);
  if (!team) throw new Error(`Team "${teamName}" not found`);

  return team.rosterPlayers.find(p => p.playerId === playerId);
}

/**
 * Update coach information
 */
async function updateCoach(teamName, discordId, robloxId) {
  const teams = await loadTeams();
  const team = teams.find(t => t.teamName === teamName);

  if (!team) throw new Error(`Team "${teamName}" not found`);

  team.coachDiscordId = discordId;
  team.coachRobloxId = robloxId;

  await saveTeams(teams);
  return team;
}

/**
 * Get roster statistics
 */
async function getRosterStats(teamName) {
  const team = await getTeamByName(teamName);
  if (!team) throw new Error(`Team "${teamName}" not found`);

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

/**
 * Get all teams statistics
 */
async function getAllRosterStats() {
  const teams = await getAllTeams();
  return teams.map(team => ({
    teamName: team.teamName,
    teamCode: team.teamCode,
    currentPlayers: team.rosterPlayers.length,
    rosterLimit: team.rosterLimit,
    availableSlots: team.rosterLimit - team.rosterPlayers.length,
    isRosterFull: team.rosterPlayers.length >= team.rosterLimit,
  }));
}

/**
 * Clear roster for a team
 */
async function clearRoster(teamName) {
  const teams = await loadTeams();
  const team = teams.find(t => t.teamName === teamName);

  if (!team) throw new Error(`Team "${teamName}" not found`);

  const clearedCount = team.rosterPlayers.length;
  team.rosterPlayers = [];

  await saveTeams(teams);
  return { teamName, clearedCount };
}

/**
 * Export all utility functions
 */
module.exports = {
  loadTeams,
  saveTeams,
  getAllTeams,
  getTeamByName,
  getTeamByCode,
  addPlayerToRoster,
  removePlayerFromRoster,
  getPlayerFromRoster,
  updateCoach,
  getRosterStats,
  getAllRosterStats,
  clearRoster,
};
