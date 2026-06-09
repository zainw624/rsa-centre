import { prisma } from './prismaClient';
import { fetchGuildRoles } from './discord';
import fs from 'fs/promises';
import path from 'path';

export async function getTeamRoster(teamName: string) {
  return prisma.team.findFirst({
    where: { teamName },
    include: { rosterPlayers: true },
  });
}

export async function getTransfers(limit = 25) {
  return prisma.transfer.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getRecentActivity(limit = 20) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getUpcomingFixtures(limit = 5) {
  return prisma.fixture.findMany({
    where: { archived: false, status: 'scheduled' },
    orderBy: { kickoff: 'asc' },
    take: limit,
  });
}

export async function getTotals() {
  const [playersCount, teamsCount, managersCount, assistantManagersCount, staffCount] = await Promise.all([
    prisma.rosterPlayer.count({ where: { active: true } }),
    prisma.team.count(),
    prisma.managerAssignment.count({ where: { active: true, role: 'manager' } }),
    prisma.managerAssignment.count({ where: { active: true, role: 'assistant' } }),
    prisma.user.count({ where: { roles: { has: 'staff' } } }),
  ]);

  return { playersCount, teamsCount, managersCount, assistantManagersCount, staffCount };
}

export async function getSettings() {
  return prisma.settings.findFirst();
}

export async function getLatestResults(limit = 5) {
  return prisma.result.findMany({ orderBy: { matchDate: 'desc' }, take: limit });
}

export async function getLeagueSnapshot(limit = 5) {
  return prisma.leagueTable.findMany({ orderBy: { position: 'asc' }, take: limit, include: { team: true } });
}

export async function getActiveSanctions(limit = 10) {
  return prisma.sanction.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' }, take: limit });
}

export async function getCupTiedPlayers() {
  return prisma.sanction.findMany({ where: { sanctionType: { contains: 'cup' }, status: 'active' } });
}

export async function getLeagueHealth() {
  const totalFixtures = await prisma.fixture.count();
  const upcoming = await prisma.fixture.count({ where: { status: 'scheduled', archived: false } });
  const played = await prisma.result.count();
  const percentCompleted = totalFixtures === 0 ? 0 : Math.round((played / Math.max(1, totalFixtures)) * 100);
  return { totalFixtures, upcoming, played, percentCompleted };
}

export async function getWorldCupOverview() {
  const [settings, cupTiedPlayers, activeSanctions, totalTeams] = await Promise.all([
    getSettings(),
    getCupTiedPlayers(),
    getActiveSanctions(),
    prisma.team.count(),
  ]);

  return {
    settings,
    cupTiedPlayers,
    activeSanctions,
    totalTeams,
  };
}

export async function getLeagueTableGroups() {
  const rows = await prisma.leagueTable.findMany({
    include: {
      team: true,
      season: true,
    },
    orderBy: [{ season: { current: 'desc' } }, { position: 'asc' }],
  });

  return rows.reduce((groups: Record<string, any[]>, row: any) => {
    const seasonName = row.season?.name ?? 'Unassigned Season';
    const seasonKey = row.season?.current ? `${seasonName} (Current)` : seasonName;
    if (!groups[seasonKey]) {
      groups[seasonKey] = [];
    }
    groups[seasonKey].push(row);
    return groups;
  }, {});
}

export async function getStatisticsSummary() {
  const [totals, fixturesCount, resultsCount, completedTransfersCount, pendingTransfersCount, declinedTransfersCount, activeSanctionsCount, cupTiedCount, seasonsCount, leagueTableEntriesCount] = await Promise.all([
    getTotals(),
    prisma.fixture.count({ where: { archived: false } }),
    prisma.result.count(),
    prisma.transfer.count({ where: { status: 'completed' } }),
    prisma.transfer.count({ where: { status: 'pending' } }),
    prisma.transfer.count({ where: { status: 'declined' } }),
    prisma.sanction.count({ where: { status: 'active' } }),
    prisma.sanction.count({ where: { sanctionType: { contains: 'cup' }, status: 'active' } }),
    prisma.season.count(),
    prisma.leagueTable.count(),
  ]);

  return {
    ...totals,
    fixturesCount,
    resultsCount,
    completedTransfersCount,
    pendingTransfersCount,
    declinedTransfersCount,
    activeSanctionsCount,
    cupTiedCount,
    seasonsCount,
    leagueTableEntriesCount,
  };
}

export async function getComplianceSummary() {
  try {
    const filePath = path.join(process.cwd(), '..', 'data', 'compliance.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw ?? '{}');
    const violations = Array.isArray(data.violations) ? data.violations : [];
    const warnings = Array.isArray(data.warnings) ? data.warnings : [];
    const lastScan = data.lastScan ?? null;
    const violationsByType = violations.reduce((acc: Record<string, number>, violation: any) => {
      acc[violation.type] = (acc[violation.type] ?? 0) + 1;
      return acc;
    }, {});

    return {
      violations,
      warnings,
      lastScan,
      totalViolations: violations.length,
      activeWarnings: warnings.filter((warning: any) => warning.status === 'ACTIVE').length,
      critical: violations.filter((violation: any) => violation.severity === 'CRITICAL').length,
      high: violations.filter((violation: any) => violation.severity === 'HIGH').length,
      medium: violations.filter((violation: any) => violation.severity === 'MEDIUM').length,
      low: violations.filter((violation: any) => violation.severity === 'LOW').length,
      violationsByType,
    };
  } catch (error) {
    return {
      violations: [],
      warnings: [],
      lastScan: null,
      totalViolations: 0,
      activeWarnings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      violationsByType: {},
    };
  }
}

export async function getAllTeams() {
  const teams = await prisma.team.findMany({
    orderBy: { teamName: 'asc' },
    include: {
      rosterPlayers: { where: { active: true } },
      managerAssignments: { where: { active: true } },
      fixtures: { where: { archived: false }, orderBy: { kickoff: 'asc' }, take: 5 },
      results: { orderBy: { matchDate: 'desc' }, take: 5 },
    },
  });
  // Strip internal-only fields — Discord role IDs must never reach the client.
  return teams.map(({ roleId, coachDiscordId, ...rest }) => rest);
}

export async function getTeamByCodeOrName(value: string) {
  const team = await prisma.team.findFirst({
    where: {
      OR: [
        { teamName: value },
        { teamCode: value },
        { teamId: value },
      ],
    },
    include: {
      rosterPlayers: { where: { active: true } },
      managerAssignments: { where: { active: true }, include: { user: true } },
      fixtures: { where: { archived: false }, orderBy: { kickoff: 'asc' }, take: 20 },
      results: { orderBy: { matchDate: 'desc' }, take: 20 },
    },
  });
  if (!team) return null;
  // Strip internal-only fields — Discord role IDs must never reach the client.
  const { roleId, coachDiscordId, ...rest } = team;
  return rest;
}

export async function getAllPlayers() {
  const rosterEntries = await prisma.rosterPlayer.findMany({
    orderBy: { joinedAt: 'desc' },
    include: { team: true, user: true },
  });

  const playersMap: Record<string, any> = {};
  rosterEntries.forEach((entry: any) => {
    const existing = playersMap[entry.playerId] ?? {
      playerId: entry.playerId,
      playerTag: entry.playerTag,
      user: entry.user,
      rosterHistory: [],
      currentTeam: null,
      active: false,
    };

    existing.rosterHistory.push(entry);
    if (entry.active) {
      existing.active = true;
      existing.currentTeam = entry.team;
    }

    if (!existing.user && entry.user) {
      existing.user = entry.user;
    }

    playersMap[entry.playerId] = existing;
  });

  return Object.values(playersMap).map((player: any) => {
    const latestEntry = player.rosterHistory[0] ?? null;
    return {
      playerId: player.playerId,
      playerTag: player.playerTag || latestEntry?.playerTag || 'Unknown',
      user: player.user || null,
      currentTeam: player.currentTeam || latestEntry?.team || null,
      currentStatus: player.active ? 'Active' : 'Free Agent',
      rosterCount: player.rosterHistory.length,
      joinedAt: latestEntry?.joinedAt,
    };
  });
}

export async function getPlayerProfileById(playerId: string) {
  const rosterEntries = await prisma.rosterPlayer.findMany({
    where: { playerId },
    orderBy: { joinedAt: 'desc' },
    include: { team: true, user: true },
  });

  const user = rosterEntries.find((entry: any) => entry.user)?.user ?? await prisma.user.findUnique({ where: { discordId: playerId } });
  const playerTag = rosterEntries[0]?.playerTag || user?.name || 'Unknown Player';
  const currentRoster = rosterEntries.find((entry: any) => entry.active) ?? rosterEntries[0] ?? null;
  const transfers = await prisma.transfer.findMany({
    where: {
      OR: [
        { playerId },
        { playerTag: playerTag },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  const sanctions = await prisma.sanction.findMany({
    where: {
      OR: [
        { playerId },
        { playerTag: playerTag },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  const activity = await prisma.activityLog.findMany({
    where: {
      OR: [
        { playerId },
        { playerTag: playerTag },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const activeSanctions = sanctions.filter((sanction) => sanction.status === 'active');
  const cupTied = activeSanctions.some((sanction) => sanction.sanctionType.toLowerCase().includes('cup'));
  const isEligible = !activeSanctions.length && !cupTied;

  return {
    playerId,
    playerTag,
    user,
    currentTeam: currentRoster?.team || null,
    currentStatus: currentRoster?.active ? 'Active' : 'Free Agent',
    rosterHistory: rosterEntries,
    transfers,
    sanctions,
    activity,
    cupTied,
    eligible: isEligible,
    totalTransfers: transfers.length,
    totalSanctions: sanctions.length,
    totalActivity: activity.length,
  };
}

export async function getActivityEvents(limit = 100) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getActivityFilterOptions() {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  const playersMap: Record<string, any> = {};
  const teamsMap: Record<string, any> = {};
  const staffMap: Record<string, any> = {};
  const eventTypes = new Set<string>();
  const staffIds = new Set<string>();

  logs.forEach((log: any) => {
    if (log.playerId) {
      playersMap[log.playerId] = { id: log.playerId, label: log.playerTag || log.playerId };
    }
    if (log.teamId) {
      teamsMap[log.teamId] = { id: log.teamId, label: log.teamName || log.teamId };
    }
    if (log.staffId) {
      staffIds.add(log.staffId);
    }
    if (log.type) {
      eventTypes.add(log.type);
    }
  });

  const staffUsers = await prisma.user.findMany({ where: { id: { in: Array.from(staffIds) } } });
  staffUsers.forEach((user: any) => {
    staffMap[user.id] = { id: user.id, label: user.name || user.discordId || user.id };
  });

  const staff = Array.from(staffIds).map((id: string) => staffMap[id] || { id, label: id });
  const players = Object.values(playersMap);
  const teams = Object.values(teamsMap);

  return {
    players,
    teams,
    staff,
    eventTypes: Array.from(eventTypes),
  };
}

export async function getHallOfFameEntries() {
  return prisma.season.findMany({
    orderBy: [{ current: 'desc' }, { name: 'desc' }],
    include: {
      hallOfFameEntries: { orderBy: { year: 'desc' } },
      awards: { orderBy: { awardedAt: 'desc' }, include: { team: true } },
      competitions: true,
      leagueTableEntries: { include: { team: true }, orderBy: { position: 'asc' } },
    },
  });
}

export async function getAwardsBySeason() {
  return prisma.season.findMany({
    orderBy: [{ current: 'desc' }, { name: 'desc' }],
    include: {
      awards: { orderBy: { awardedAt: 'desc' }, include: { team: true } },
    },
  });
}

export async function getArchiveData() {
  const [seasons, fixtures, results, transfers, competitions, awards] = await Promise.all([
    prisma.season.findMany({ orderBy: [{ current: 'desc' }, { startDate: 'desc' }], include: { competitions: true, awards: true, leagueTableEntries: { include: { team: true }, orderBy: { position: 'asc' } } } }),
    prisma.fixture.findMany({ orderBy: { kickoff: 'desc' }, take: 100 }),
    prisma.result.findMany({ orderBy: { matchDate: 'desc' }, take: 100 }),
    prisma.transfer.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.competition.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.award.findMany({ orderBy: { awardedAt: 'desc' } }),
  ]);

  return {
    seasons,
    fixtures,
    results,
    transfers,
    competitions,
    awards,
  };
}

export async function getSearchResults(query: string, type?: string) {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  const results: Array<{ category: string; items: any[] }> = [];
  const searchText = normalized.toLowerCase();

  if (!type || type === 'players') {
    const players = await prisma.rosterPlayer.findMany({
      where: {
        OR: [
          { playerTag: { contains: searchText, mode: 'insensitive' } },
          { playerId: { contains: searchText, mode: 'insensitive' } },
          { user: { name: { contains: searchText, mode: 'insensitive' } } },
        ],
      },
      include: { team: true, user: true },
      take: 20,
    });
    if (players.length) results.push({ category: 'Players', items: players });
  }

  if (!type || type === 'teams') {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { teamName: { contains: searchText, mode: 'insensitive' } },
          { teamCode: { contains: searchText, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
    if (teams.length) results.push({ category: 'Teams', items: teams });
  }

  if (!type || type === 'managers') {
    const managers = await prisma.managerAssignment.findMany({
      where: {
        OR: [
          { user: { name: { contains: searchText, mode: 'insensitive' } } },
          { team: { teamName: { contains: searchText, mode: 'insensitive' } } },
        ],
      },
      include: { user: true, team: true },
      take: 20,
    });
    if (managers.length) results.push({ category: 'Managers', items: managers });
  }

  if (!type || type === 'staff') {
    const staff = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchText, mode: 'insensitive' } },
          { discordId: { contains: searchText, mode: 'insensitive' } },
          { roles: { has: searchText } },
        ],
      },
      take: 20,
    });
    if (staff.length) results.push({ category: 'Staff', items: staff });
  }

  if (!type || type === 'fixtures') {
    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [
          { homeTeam: { contains: searchText, mode: 'insensitive' } },
          { awayTeam: { contains: searchText, mode: 'insensitive' } },
          { competition: { contains: searchText, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
    if (fixtures.length) results.push({ category: 'Fixtures', items: fixtures });
  }

  if (!type || type === 'results') {
    const resultsItems = await prisma.result.findMany({
      where: {
        OR: [
          { homeTeam: { contains: searchText, mode: 'insensitive' } },
          { awayTeam: { contains: searchText, mode: 'insensitive' } },
          { competition: { contains: searchText, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
    if (resultsItems.length) results.push({ category: 'Results', items: resultsItems });
  }

  if (!type || type === 'transfers') {
    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          { playerTag: { contains: searchText, mode: 'insensitive' } },
          { playerId: { contains: searchText, mode: 'insensitive' } },
          { fromTeam: { contains: searchText, mode: 'insensitive' } },
          { toTeam: { contains: searchText, mode: 'insensitive' } },
          { action: { contains: searchText, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
    if (transfers.length) results.push({ category: 'Transfers', items: transfers });
  }

  if (!type || type === 'competitions') {
    const competitions = await prisma.competition.findMany({
      where: { name: { contains: searchText, mode: 'insensitive' } },
      take: 20,
    });
    if (competitions.length) results.push({ category: 'Competitions', items: competitions });
  }

  if (!type || type === 'awards') {
    const awards = await prisma.award.findMany({
      where: {
        OR: [
          { name: { contains: searchText, mode: 'insensitive' } },
          { achievement: { contains: searchText, mode: 'insensitive' } },
          { recipientId: { contains: searchText, mode: 'insensitive' } },
        ],
      },
      include: { team: true },
      take: 20,
    });
    if (awards.length) results.push({ category: 'Awards', items: awards });
  }

  return results;
}

export async function createNotification(data: any) {
  const notificationData = {
    level: data.level ?? 'info',
    active: data.active ?? true,
    readBy: data.readBy ?? [],
    ...data,
  };

  return prisma.notification.create({ data: notificationData });
}

export async function getNotificationsForUser(userId: string, unreadOnly = false) {
  const where = unreadOnly ? { NOT: [{ readBy: { has: userId } }] } : {};
  return prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
}

export async function markNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { NOT: [{ readBy: { has: userId } }] },
    data: { readBy: { push: userId } },
  });
  return prisma.notification.count({ where: { NOT: [{ readBy: { has: userId } }] } });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { NOT: [{ readBy: { has: userId } }] } });
}

export async function getAdministrationSummary() {
  const [settings, userCount, teamCount, transferCount, pendingTransfers, activeSanctions, cupTied, recentAudit, recentSystem] = await Promise.all([
    prisma.settings.findFirst(),
    prisma.user.count(),
    prisma.team.count(),
    prisma.transfer.count(),
    prisma.transfer.count({ where: { status: 'pending' } }),
    prisma.sanction.count({ where: { status: 'active' } }),
    prisma.sanction.count({ where: { sanctionType: { contains: 'cup' }, status: 'active' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  return {
    settings,
    userCount,
    teamCount,
    transferCount,
    pendingTransfers,
    activeSanctions,
    cupTied,
    recentAudit,
    recentSystem,
  };
}

export async function getManagerAssignmentsFromRoles() {
  // Build mapping of roleId -> roleName from Discord
  const roleMap = await fetchGuildRoles();

  // Load teams with configured roleId
  const teams = await prisma.team.findMany({ where: { roleId: { not: null } } });

  // Load users who have manager-related staff roles
  const users = await prisma.user.findMany({ where: { OR: [{ roles: { has: 'RSA | Managers' } }, { roles: { has: 'RSA | Assistant Managers' } }] } });

  const assignments: Array<any> = [];

  for (const user of users) {
    for (const team of teams) {
      if (!team.roleId) continue;
      const teamRoleName = roleMap[team.roleId];
      if (!teamRoleName) continue;
      // If user has both the general manager role and the team role name, consider them assigned
      if (user.roles.includes(teamRoleName)) {
        const role = user.roles.includes('RSA | Assistant Managers') ? 'assistant' : 'manager';
        assignments.push({ user, team, role });
      }
    }
  }

  return assignments;
}

export async function getPendingTransfers(limit = 50) {
  return prisma.transfer.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' }, take: limit });
}

export async function getDeclinedTransfers(limit = 50) {
  return prisma.transfer.findMany({ where: { status: 'declined' }, orderBy: { updatedAt: 'desc' }, take: limit });
}

export async function getTransfersByAction(action: string, limit = 50) {
  return prisma.transfer.findMany({ where: { action }, orderBy: { createdAt: 'desc' }, take: limit });
}

export async function getFixtureById(id: string) {
  return prisma.fixture.findUnique({ where: { id } });
}

export async function createResult(data: any) {
  const res = await prisma.result.create({ data });
  return res;
}

export async function updateResult(id: string, data: any) {
  return prisma.result.update({ where: { id }, data });
}

export async function deleteResult(id: string) {
  return prisma.result.delete({ where: { id } });
}

export async function getGroupStandings(): Promise<Record<string, any[]>> {
  const rows = await prisma.leagueTable.findMany({
    where: { group: { not: null } },
    include: { team: true, season: true },
    orderBy: [{ group: 'asc' }, { points: 'desc' }, { goalDifference: 'desc' }, { goalsFor: 'desc' }],
  });

  const result: Record<string, any[]> = { A: [], B: [], C: [], D: [] };
  rows.forEach((row: any) => {
    const g: string = row.group ?? '';
    if (g && result[g] !== undefined) result[g].push(row);
  });

  Object.keys(result).forEach((g) => {
    result[g] = result[g].map((row: any, i: number) => ({ ...row, position: i + 1 }));
  });

  return result;
}

export async function getPlayerLeaderboard(seasonId?: string) {
  const where: any = {};
  if (seasonId) where.seasonId = seasonId;

  const stats = await prisma.playerStat.findMany({
    where,
    include: { team: true },
    take: 200,
  });

  const sortBy = (key: 'goals' | 'assists' | 'cleanSheets' | 'motm') =>
    [...stats].sort((a, b) => (b[key] as number) - (a[key] as number)).slice(0, 10);

  return {
    topScorers:     sortBy('goals'),
    topAssists:     sortBy('assists'),
    topCleanSheets: sortBy('cleanSheets'),
    topMotm:        sortBy('motm'),
  };
}

export async function getCurrentSeason() {
  return prisma.season.findFirst({ where: { current: true } });
}

export async function upsertPlayerStatRecord(data: {
  playerId: string;
  playerTag: string;
  seasonId: string;
  teamId?: string | null;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  motm?: number;
}) {
  const { playerId, playerTag, seasonId, teamId = null, goals = 0, assists = 0, cleanSheets = 0, motm = 0 } = data;
  return prisma.playerStat.upsert({
    where: { playerId_seasonId: { playerId, seasonId } },
    create: { playerId, playerTag, seasonId, teamId, goals, assists, cleanSheets, motm },
    update: { playerTag, teamId, goals, assists, cleanSheets, motm },
  });
}

/** Increment player stats for one match (additive, safe for match-by-match updates) */
export async function incrementPlayerStat(data: {
  playerId: string;
  playerTag: string;
  seasonId: string;
  teamId?: string | null;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  motm?: number;
}) {
  const { playerId, playerTag, seasonId, teamId = null, goals = 0, assists = 0, cleanSheets = 0, motm = 0 } = data;

  const existing = await prisma.playerStat.findUnique({
    where: { playerId_seasonId: { playerId, seasonId } },
  });

  if (existing) {
    return prisma.playerStat.update({
      where: { playerId_seasonId: { playerId, seasonId } },
      data: {
        playerTag,
        teamId: teamId ?? existing.teamId,
        goals:       { increment: goals },
        assists:     { increment: assists },
        cleanSheets: { increment: cleanSheets },
        motm:        { increment: motm },
      },
    });
  }

  return prisma.playerStat.create({
    data: { playerId, playerTag, seasonId, teamId, goals, assists, cleanSheets, motm },
  });
}

async function resortGroupPositions(group: string, seasonId?: string) {
  const rows = await prisma.leagueTable.findMany({
    where: { group, ...(seasonId ? { seasonId } : {}) },
    orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }, { goalsFor: 'desc' }],
  });
  await Promise.all(
    rows.map((row: any, i: number) =>
      prisma.leagueTable.update({ where: { id: row.id }, data: { position: i + 1 } }),
    ),
  );
}

/**
 * Record a match result and update LeagueTable standings for both teams.
 * Win = 3 pts, Draw = 1 pt each, Loss = 0 pts.
 * Also records an ActivityLog entry.
 */
export async function updateStandingsFromResult(data: {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  seasonId?: string;
  competition?: string;
  submittedById?: string;
}) {
  const { homeTeamName, awayTeamName, homeScore, awayScore, seasonId, competition = 'RSA Season 2026', submittedById } = data;

  const findTeam = (name: string) =>
    prisma.team.findFirst({
      where: {
        OR: [
          { teamName: { equals: name, mode: 'insensitive' } },
          { teamCode: { equals: name, mode: 'insensitive' } },
          { teamId:   { equals: name.toLowerCase() } },
          { teamName: { contains: name, mode: 'insensitive' } },
        ],
      },
    });

  const [homeTeam, awayTeam] = await Promise.all([findTeam(homeTeamName), findTeam(awayTeamName)]);
  if (!homeTeam) return { ok: false, error: `Team not found: ${homeTeamName}` };
  if (!awayTeam) return { ok: false, error: `Team not found: ${awayTeamName}` };

  const homeWin  = homeScore > awayScore;
  const awayWin  = awayScore > homeScore;
  const draw     = homeScore === awayScore;

  const findEntry = (teamId: string) =>
    prisma.leagueTable.findFirst({ where: { teamId, ...(seasonId ? { seasonId } : {}) } });

  const [homeEntry, awayEntry] = await Promise.all([findEntry(homeTeam.id), findEntry(awayTeam.id)]);

  const updates: Promise<any>[] = [];

  if (homeEntry) {
    updates.push(
      prisma.leagueTable.update({
        where: { id: homeEntry.id },
        data: {
          played:        { increment: 1 },
          won:           { increment: homeWin ? 1 : 0 },
          drew:          { increment: draw    ? 1 : 0 },
          lost:          { increment: awayWin ? 1 : 0 },
          goalsFor:      { increment: homeScore },
          goalsAgainst:  { increment: awayScore },
          goalDifference:{ increment: homeScore - awayScore },
          points:        { increment: homeWin ? 3 : draw ? 1 : 0 },
        },
      }),
    );
  }

  if (awayEntry) {
    updates.push(
      prisma.leagueTable.update({
        where: { id: awayEntry.id },
        data: {
          played:        { increment: 1 },
          won:           { increment: awayWin ? 1 : 0 },
          drew:          { increment: draw    ? 1 : 0 },
          lost:          { increment: homeWin ? 1 : 0 },
          goalsFor:      { increment: awayScore },
          goalsAgainst:  { increment: homeScore },
          goalDifference:{ increment: awayScore - homeScore },
          points:        { increment: awayWin ? 3 : draw ? 1 : 0 },
        },
      }),
    );
  }

  // Record the result
  updates.push(
    prisma.result.create({
      data: {
        homeTeam:   homeTeam.teamName,
        awayTeam:   awayTeam.teamName,
        homeScore,
        awayScore,
        competition,
        matchDate:  new Date(),
        status:     'completed',
        teamId:     homeTeam.id,
      },
    }),
  );

  // Activity log
  updates.push(
    prisma.activityLog.create({
      data: {
        type:     'result',
        text:     `${homeTeam.teamName} ${homeScore}–${awayScore} ${awayTeam.teamName}`,
        emoji:    '⚽',
        teamId:   homeTeam.id,
        teamName: homeTeam.teamName,
        staffId:  submittedById,
      },
    }),
  );

  await Promise.all(updates);

  // Re-sort group positions
  const groupsSeen = new Set<string>();
  if (homeTeam.group) groupsSeen.add(homeTeam.group);
  if (awayTeam.group) groupsSeen.add(awayTeam.group);
  await Promise.all([...groupsSeen].map((g) => resortGroupPositions(g, seasonId)));

  return {
    ok: true,
    homeTeam: homeTeam.teamName,
    awayTeam: awayTeam.teamName,
    homeScore,
    awayScore,
    homeEntry: Boolean(homeEntry),
    awayEntry: Boolean(awayEntry),
  };
}
