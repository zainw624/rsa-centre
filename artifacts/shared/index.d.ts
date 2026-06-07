export interface TeamConfig {
  defaultSeason: string;
  maxPlayers: number;
  rosterSize: {
    min: number;
    max: number;
  };
  badgeShape: string;
}

export interface LeagueRoles {
  manager: 'manager';
  assistant: 'assistant';
  staff: 'staff';
}

export const PERMISSIONS: {
  ADMIN: 'ADMIN';
  MANAGE_ROSTERS: 'MANAGE_ROSTERS';
  VIEW_LEAGUE: 'VIEW_LEAGUE';
  EDIT_FIXTURES: 'EDIT_FIXTURES';
};

export const TEAM_CONFIG: TeamConfig;
export const LEAGUE_ROLES: LeagueRoles;
