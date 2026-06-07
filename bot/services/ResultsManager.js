const resultsStore = require('../storage/ResultsStore');

class ResultsManager {
  constructor() {
    this.results = [];
  }

  async initialize() {
    const data = await resultsStore.load();
    this.results = data.results || [];
  }

  async validate() {
    const errors = [];
    if (!Array.isArray(this.results)) {
      errors.push('Results data must be an array');
      return errors;
    }
    for (const result of this.results) {
      if (!result.id || !result.homeTeam || !result.awayTeam || result.homeScore === undefined || result.awayScore === undefined) {
        errors.push(`Invalid result definition: ${JSON.stringify(result)}`);
      }
    }
    return errors;
  }

  async addResult(resultData) {
    const newResult = {
      id: `result_${Date.now()}`,
      homeTeam: resultData.homeTeam,
      awayTeam: resultData.awayTeam,
      homeScore: resultData.homeScore,
      awayScore: resultData.awayScore,
      date: resultData.date || new Date().toISOString(),
      competition: resultData.competition || 'League',
      stadium: resultData.stadium || 'Unknown',
      attendance: resultData.attendance || 0,
      notes: resultData.notes || '',
      addedBy: resultData.addedBy,
      addedAt: new Date().toISOString(),
    };

    this.results.push(newResult);
    await this.syncResults();
    return newResult;
  }

  async editResult(resultId, updates) {
    const result = this.results.find((r) => r.id === resultId);
    if (!result) return null;

    const updated = {
      ...result,
      ...updates,
      editedBy: updates.editedBy,
      editedAt: new Date().toISOString(),
    };

    const index = this.results.findIndex((r) => r.id === resultId);
    this.results[index] = updated;
    await this.syncResults();
    return updated;
  }

  async removeResult(resultId) {
    const index = this.results.findIndex((r) => r.id === resultId);
    if (index === -1) return false;

    const removed = this.results.splice(index, 1)[0];
    await this.syncResults();
    return removed;
  }

  getResultById(resultId) {
    return this.results.find((r) => r.id === resultId);
  }

  getResultsByTeam(teamName) {
    return this.results.filter((r) => r.homeTeam === teamName || r.awayTeam === teamName);
  }

  getResultsByCompetition(competition) {
    return this.results.filter((r) => r.competition === competition);
  }

  getAllResults() {
    return this.results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getRecentResults(limit = 10) {
    return this.getAllResults().slice(0, limit);
  }

  async syncResults() {
    this.results.sort((a, b) => new Date(b.date) - new Date(a.date));
    await resultsStore.save({
      results: this.results,
      lastUpdated: new Date().toISOString(),
    });
  }
}

module.exports = ResultsManager;
