const { loadSettings, updateSettings } = require('./settings');

async function loadTransferWindow() {
  const settings = await loadSettings();
  return settings.transferWindowOpen === true;
}

async function setTransferWindow(value) {
  return updateSettings({ transferWindowOpen: value });
}

module.exports = {
  loadTransferWindow,
  setTransferWindow,
};
