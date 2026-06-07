const storage = require('./storage');
const settings = require('./settings');
const teams = require('./teams');
const transactions = require('./transactions');
const permissions = require('./permissions');
const embeds = require('./embeds');
const transferWindow = require('./transferWindow');

module.exports = {
  ...storage,
  ...settings,
  ...teams,
  ...transactions,
  ...permissions,
  ...embeds,
  ...transferWindow,
};
