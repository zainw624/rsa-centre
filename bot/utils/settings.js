const path = require('path');
const { readJSON, writeJSON, ensureFile } = require('./storage');
const {
  HIERARCHY,
  ADMIN_ROLES,
  LEAGUE_AND_ADMIN,
  MANAGER_ROLES,
} = require('./hierarchy');

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
  managerRoleNames: [...MANAGER_ROLES],
  // Discipline / sanctions — league staff & admins (website manageDiscipline)
  sanctionRoleNames: [...LEAGUE_AND_ADMIN],
  // Audit logs — league staff & admins (website viewAdmin)
  auditRoleNames: [...LEAGUE_AND_ADMIN],
  // World Cup lock — league staff & admins (website manageCompetitions)
  worldCupLockRoleNames: [...LEAGUE_AND_ADMIN],
  // World Cup unlock is destructive — kept to leadership only on purpose
  worldCupUnlockRoleNames: [...ADMIN_ROLES],
  staffCentreRoleNames: [...HIERARCHY],
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
