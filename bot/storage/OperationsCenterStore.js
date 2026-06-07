const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_OPERATIONS_CENTER = {
  guildId: null,
  channelId: null,
  messageId: null,
  currentPage: 0,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

module.exports = new JsonStorage(
  path.join(__dirname, '..', 'data', 'operationsCenter.json'),
  DEFAULT_OPERATIONS_CENTER
);
