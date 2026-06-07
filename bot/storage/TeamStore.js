const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_TEAMS = {
  teams: [],
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'teams.json'), DEFAULT_TEAMS);
