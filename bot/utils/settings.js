const path = require('path');
const { readJSON, writeJSON, ensureFile } = require('./storage');

const SETTINGS_PATH = path.join(__dirname, '..', 'data', 'settings.json');

const DEFAULT_SETTINGS = {
  botOwnerId: 'BOT_OWNER_ID_HERE',
  botCommandsChannelId: '1512871626637578371',
  contractsChannelId: '1512857515858329841',
  releaseChannelId: '1512857516860637386',
  fixturesAnnouncementChannelId: '1509978110647336990',
  freeAgentRoleName: 'Free Agent',
  sanctionedRoleId: '1483172660228919407',
  cupTiedRoleId: '1512515140346445876',
  managerRoleNames: ['RSA | Managers', 'RSA | Assistant Managers'],
  sanctionRoleNames: ['RSA | Founders', 'RSA | Co Founders', 'RSA | Executive', 'RSA | Chairman', 'RSA | Vice Chairman', 'RSA | Staff'],
  auditRoleNames: ['RSA | Founders', 'RSA | Co Founders', 'RSA | Executive', 'RSA | Chairman', 'RSA | Vice Chairman'],
  worldCupLockRoleNames: ['RSA | Founders', 'RSA | Co Founders', 'RSA | Executive', 'RSA | Chairman', 'RSA | Vice Chairman'],
  worldCupUnlockRoleNames: ['RSA | Founders', 'RSA | Co Founders'],
  staffCentreRoleNames: [
    'RSA | Founders',
    'RSA | Co Founders',
    'RSA | Executive',
    'RSA | Chairman',
    'RSA | Vice Chairman',
    'RSA | Board of Directors',
    'RSA | Director',
    'RSA | Head of Development',
    'RSA | Head Of Staff',
    'RSA | Developer',
    'RSA | Senior Staff',
    'RSA | Staff',
    'RSA | Media',
    'RSA | Panel',
    'RSA | Officials',
  ],
  worldCupMode: false,
  transferWindowOpen: true,
};

async function loadSettings() {
  await ensureFile(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  const loaded = await readJSON(SETTINGS_PATH, DEFAULT_SETTINGS);
  const merged = { ...DEFAULT_SETTINGS, ...loaded };
  if (JSON.stringify(merged, null, 2) !== JSON.stringify(loaded, null, 2)) {
    await writeJSON(SETTINGS_PATH, merged);
  }
  return merged;
}

async function saveSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  await writeJSON(SETTINGS_PATH, merged);
  return merged;
}

async function updateSettings(updates) {
  const current = await loadSettings();
  return saveSettings({ ...current, ...updates });
}

module.exports = {
  loadSettings,
  saveSettings,
  updateSettings,
};
