const path = require('path');
const { JsonStorage } = require('../storage/JsonStorage');

const CONFIG_FILE = path.join(__dirname, '..', 'data', 'settings.json');
const DEFAULT_CONFIG = {
  botOwnerId: null,
  loggingEnabled: true,
  auditLogChannelId: null,
  managerRoleNames: ['RSA | Managers'],
  assistantManagerRoleNames: ['RSA | Assistant Managers'],
  nationalTeamRoleNames: [
    'Belgium', 'Brazil', 'Croatia', 'England', 'France', 'Germany', 'Ghana', 'Japan',
    'Morocco', 'Netherlands', 'Norway', 'Senegal', 'Spain', 'Sweden', 'Türkiye', 'USA'
  ],
};

class ConfigLoader {
  constructor() {
    this.storage = new JsonStorage(CONFIG_FILE, DEFAULT_CONFIG);
    this.config = DEFAULT_CONFIG;
  }

  async load() {
    this.config = await this.storage.load();
    return this.config;
  }

  validate() {
    const errors = [];
    if (!this.config.botOwnerId) {
      errors.push('botOwnerId is required in settings.json');
    }
    if (!Array.isArray(this.config.managerRoleNames) || this.config.managerRoleNames.length === 0) {
      errors.push('managerRoleNames must be a non-empty array');
    }
    if (!Array.isArray(this.config.assistantManagerRoleNames) || this.config.assistantManagerRoleNames.length === 0) {
      errors.push('assistantManagerRoleNames must be a non-empty array');
    }
    if (!Array.isArray(this.config.nationalTeamRoleNames) || this.config.nationalTeamRoleNames.length === 0) {
      errors.push('nationalTeamRoleNames must be a non-empty array');
    }
    return errors;
  }

  get(key) {
    return this.config[key];
  }
}

module.exports = new ConfigLoader();
