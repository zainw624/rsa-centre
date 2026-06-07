const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_RESULTS = {
  results: [],
  lastUpdated: new Date().toISOString(),
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'results.json'), DEFAULT_RESULTS);
