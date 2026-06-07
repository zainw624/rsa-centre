const fixtureStore = require('../storage/FixtureStore');

function createFixtureId() {
  return `FIX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function parseKickoffDate(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return null;
  const trimmed = rawInput.trim();

  let candidate = trimmed;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(trimmed)) {
    candidate = `${trimmed.replace(' ', 'T')}:00Z`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    candidate = `${trimmed}T00:00:00Z`;
  }

  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function archiveExpiredFixtures(fixtures) {
  const now = Date.now();
  let updated = false;

  for (const fixture of fixtures) {
    if (fixture.archived) continue;
    const kickoffTime = new Date(fixture.kickoff).getTime();
    if (fixture.status === 'completed' || (!Number.isNaN(kickoffTime) && kickoffTime <= now)) {
      fixture.archived = true;
      updated = true;
    }
  }

  return { fixtures, updated };
}

async function saveFixtures(fixtures) {
  return fixtureStore.save({ fixtures });
}

async function loadFixtures() {
  const data = await fixtureStore.load();
  const fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];
  const normalized = archiveExpiredFixtures(fixtures);
  if (normalized.updated) {
    await saveFixtures(normalized.fixtures);
  }
  return normalized.fixtures;
}

async function addFixture({ homeTeam, awayTeam, homeTeamCode, awayTeamCode, kickoff, competition, venue, notes, creatorId, creatorName }) {
  const fixtures = await loadFixtures();

  const duplicate = fixtures.find(
    (fixture) =>
      fixture.homeTeam === homeTeam &&
      fixture.awayTeam === awayTeam &&
      fixture.kickoff === kickoff
  );

  if (duplicate) {
    throw new Error('A fixture with the same teams and kickoff time already exists.');
  }

  const fixture = {
    id: createFixtureId(),
    homeTeam,
    awayTeam,
    homeTeamCode,
    awayTeamCode,
    kickoff,
    competition: competition || 'Friendly',
    venue: venue || 'TBD',
    notes: notes || '',
    status: 'scheduled',
    archived: false,
    createdAt: new Date().toISOString(),
    creatorId,
    creatorName,
  };

  fixtures.push(fixture);
  await saveFixtures(fixtures);
  return fixture;
}

async function getUpcomingFixtures(limit = 5) {
  const fixtures = await loadFixtures();
  const upcoming = fixtures
    .filter((fixture) => !fixture.archived && fixture.status === 'scheduled')
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
    .slice(0, limit);

  return upcoming;
}

module.exports = {
  parseKickoffDate,
  createFixtureId,
  addFixture,
  loadFixtures,
  getUpcomingFixtures,
};
