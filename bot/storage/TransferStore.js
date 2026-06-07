const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_TRANSFERS = {
  transfers: [],
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'transfers.json'), DEFAULT_TRANSFERS);
