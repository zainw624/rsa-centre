const teamStore = require('../storage/TeamStore');

class TeamManager {
  constructor() {
    this.teams = [];
  }

  async initialize() {
    this.teams = await teamStore.load().then((data) => data.teams || []);
  }

  async validateTeams() {
    const errors = [];
    if (!Array.isArray(this.teams)) {
      errors.push('Teams data must be an array');
      return errors;
    }
    for (const team of this.teams) {
      if (!team.teamName || !team.teamCode) {
        errors.push(`Invalid team definition: ${JSON.stringify(team)}`);
      }
    }
    return errors;
  }

  async syncTeams() {
    await teamStore.save({ teams: this.teams });
  }

  getTeamByName(name) {
    return this.teams.find((team) => team.teamName === name || team.teamCode === name);
  }
}

module.exports = TeamManager;
