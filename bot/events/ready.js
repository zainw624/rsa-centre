const { loadSettings } = require('../utils/settings');

module.exports = {
  name: 'appReady',
  once: true,
  async execute(client) {
    const settings = await loadSettings();
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`✅ Bot owner is configured as ${settings.botOwnerId}`);
    console.log(`✅ Ready to manage RSA national teams`);
  },
};
