const fixtureStore = require('../storage/FixtureStore');

class FixtureManager {
  constructor() {
    this.fixtures = [];
  }

  async initialize() {
    const data = await fixtureStore.load();
    this.fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];
  }

  async validateFixtures() {
    const errors = [];
    if (!Array.isArray(this.fixtures)) {
      errors.push('Fixtures must be an array');
      return errors;
    }
    for (const fixture of this.fixtures) {
      if (!fixture.homeTeam || !fixture.awayTeam || !fixture.kickoff) {
        errors.push(`Invalid fixture record: ${JSON.stringify(fixture)}`);
      }
    }
    return errors;
  }

  getAllFixtures() {
    return this.fixtures || [];
  }

  getFixtures() {
    return this.getAllFixtures();
  }

  getFixturesByTeam(teamName) {
    if (!teamName) return [];
    return this.fixtures.filter((f) => f.homeTeam === teamName || f.awayTeam === teamName);
  }

  getUpcomingFixtures(limit = 10) {
    const now = new Date();
    return this.fixtures
      .filter((f) => new Date(f.kickoff) > now)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
      .slice(0, limit);
  }

  getPastFixtures(limit = 10) {
    const now = new Date();
    return this.fixtures
      .filter((f) => new Date(f.kickoff) <= now)
      .sort((a, b) => new Date(b.kickoff) - new Date(a.kickoff))
      .slice(0, limit);
  }

  getFixtureById(fixtureId) {
    if (!fixtureId) return null;
    return this.fixtures.find((f) => f.id === fixtureId);
  }

  async addFixture(fixture) {
    if (!fixture || !fixture.homeTeam || !fixture.awayTeam || !fixture.kickoff) {
      throw new Error('Fixture must include homeTeam, awayTeam, and kickoff');
    }

    const newFixture = {
      id: fixture.id || `fixture_${Date.now()}`,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      kickoff: fixture.kickoff,
      competition: fixture.competition || 'League',
      stadium: fixture.stadium || 'Unknown',
      status: fixture.status || 'scheduled',
      createdAt: new Date().toISOString(),
    };

    this.fixtures.push(newFixture);
    await this.syncFixtures();
    return newFixture;
  }

  async updateFixture(fixtureId, updates) {
    const fixture = this.fixtures.find((f) => f.id === fixtureId);
    if (!fixture) return null;

    Object.assign(fixture, updates);
    await this.syncFixtures();
    return fixture;
  }

  async removeFixture(fixtureId) {
    const index = this.fixtures.findIndex((f) => f.id === fixtureId);
    if (index === -1) return false;

    this.fixtures.splice(index, 1);
    await this.syncFixtures();
    return true;
  }

  async syncFixtures() {
    await fixtureStore.save({ 
      fixtures: this.fixtures || [],
      lastUpdated: new Date().toISOString(),
    });
  }
}

module.exports = FixtureManager;
