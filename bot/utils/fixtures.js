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

// Wall-clock parts ({year, month, day, hour, minute, second}) for a UTC instant
// as seen in the given IANA time zone.
function getZonedParts(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const map = {};
  for (const part of dtf.formatToParts(new Date(instant))) {
    if (part.type !== 'literal') map[part.type] = Number(part.value);
  }
  if (map.hour === 24) map.hour = 0;
  return map;
}

// Offset (ms) between the given IANA time zone and UTC at a specific instant.
// Positive when the zone is ahead of UTC.
function getTimeZoneOffsetMs(instant, timeZone) {
  const p = getZonedParts(instant, timeZone);
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUTC - instant;
}

// Convert a wall-clock date ("YYYY-MM-DD") + time ("HH:mm") expressed in the
// given IANA time zone into the corresponding UTC Date. Returns null on bad
// input. Defaults to UTC when no zone is supplied.
function parseZonedKickoff(dateStr, timeStr, timeZone) {
  if (typeof dateStr !== 'string' || typeof timeStr !== 'string') return null;
  const date = dateStr.trim();
  const time = timeStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!/^\d{1,2}:\d{2}$/.test(time)) return null;

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hour > 23 || minute > 59) return null;

  // Reject impossible calendar dates (e.g. 2026-02-31).
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    naive.getUTCFullYear() !== year ||
    naive.getUTCMonth() !== month - 1 ||
    naive.getUTCDate() !== day
  ) {
    return null;
  }

  const zone = timeZone || 'UTC';
  try {
    // Throws RangeError for an unknown time zone identifier.
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
  } catch {
    return null;
  }

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  // One refinement pass handles DST boundaries correctly.
  let offset = getTimeZoneOffsetMs(utcGuess, zone);
  offset = getTimeZoneOffsetMs(utcGuess - offset, zone);
  const result = new Date(utcGuess - offset);
  if (Number.isNaN(result.getTime())) return null;

  // Reject wall-clock times that don't exist in the zone (e.g. the hour skipped
  // by a spring-forward DST transition). If the requested local time is real,
  // formatting the result back into the zone reproduces it exactly.
  const check = getZonedParts(result.getTime(), zone);
  if (
    check.year !== year ||
    check.month !== month ||
    check.day !== day ||
    check.hour !== hour ||
    check.minute !== minute
  ) {
    return null;
  }

  return result;
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

async function addFixture({ homeTeam, awayTeam, homeTeamCode, awayTeamCode, kickoff, competition, group, venue, notes, creatorId, creatorName }) {
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
    group: group || null,
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
  parseZonedKickoff,
  createFixtureId,
  addFixture,
  loadFixtures,
  getUpcomingFixtures,
};
