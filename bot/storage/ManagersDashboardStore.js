const path = require('path');
const { JsonStorage } = require('../storage/JsonStorage');

const DEFAULT_MANAGERS_DASHBOARD = {
  guildId: null,
  channelId: null,
  messageId: null,
  teamCards: {},
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

module.exports = new JsonStorage(
  path.join(__dirname, '..', 'data', 'managersDashboard.json'),
  DEFAULT_MANAGERS_DASHBOARD
);
