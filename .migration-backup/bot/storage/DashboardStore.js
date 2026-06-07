const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_DASHBOARD = {
  guildId: null,
  channelId: null,
  messageId: null,
  currentPage: 0,
  createdAt: null,
  lastUpdated: null,
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'dashboard.json'), DEFAULT_DASHBOARD);
