const path = require('path');
const { JsonStorage } = require('./JsonStorage');

const DEFAULT_STAFF = {
  managers: [],
  assistants: [],
  staffAudit: [],
};

module.exports = new JsonStorage(path.join(__dirname, '..', 'data', 'staff.json'), DEFAULT_STAFF);
