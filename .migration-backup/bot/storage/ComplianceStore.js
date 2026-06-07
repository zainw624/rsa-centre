const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_COMPLIANCE = {
  warnings: [],
  violations: [],
  lastScan: null,
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'compliance.json'), DEFAULT_COMPLIANCE);
