const { loadSettings, updateSettings } = require('./settings');

async function loadTransferWindow() {
  const settings = await loadSettings();
  return settings.transferWindowOpen === true;
}

async function setTransferWindow(value) {
  return updateSettings({ transferWindowOpen: value });
}

// Non-fatal: mirror the transfer-window state into the website DB so the site
// shows it correctly. A failed POST must never block the Discord-side action.
async function syncTransferWindowToWebsite(guildId, open) {
  const websiteUrl = process.env.WEBSITE_URL;
  const syncSecret = process.env.ROLES_SYNC_SECRET;
  if (!websiteUrl || !syncSecret) {
    console.warn('[transfer-window sync] skipped — WEBSITE_URL or ROLES_SYNC_SECRET not set');
    return;
  }
  try {
    const res = await fetch(`${websiteUrl}/api/bot/transfer-window`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sync-secret': syncSecret },
      body: JSON.stringify({ guildId, open }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[transfer-window sync] website responded ${res.status}: ${text}`);
    }
  } catch (error) {
    console.error('Failed to sync transfer window to website:', error);
  }
}

module.exports = {
  loadTransferWindow,
  setTransferWindow,
  syncTransferWindowToWebsite,
};
