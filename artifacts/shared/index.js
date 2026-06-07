const PERMISSIONS = {
  ADMIN: 'ADMIN',
  MANAGE_ROSTERS: 'MANAGE_ROSTERS',
  VIEW_LEAGUE: 'VIEW_LEAGUE',
  EDIT_FIXTURES: 'EDIT_FIXTURES'
};

const TEAM_CONFIG = {
  defaultSeason: '2026',
  maxPlayers: 25,
  rosterSize: { min: 16, max: 25 },
  badgeShape: 'circle'
};

const LEAGUE_ROLES = {
  manager: 'manager',
  assistant: 'assistant',
  staff: 'staff'
};

module.exports = {
  PERMISSIONS,
  TEAM_CONFIG,
  LEAGUE_ROLES
};
