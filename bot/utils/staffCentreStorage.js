const path = require('path');
const { JsonStorage } = require('../storage/JsonStorage');

const DEFAULT_STAFF_CENTRE = {
  guildId: null,
  channelId: null,
  messageId: null,
  createdAt: null,
  lastUpdated: null,
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'staffCentre.json'), DEFAULT_STAFF_CENTRE);
