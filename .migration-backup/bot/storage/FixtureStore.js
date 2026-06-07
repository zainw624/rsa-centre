const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_FIXTURES = {
  fixtures: [],
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'fixtures.json'), DEFAULT_FIXTURES);
