const { loadSettings } = require('../utils/settings');

// Auto-scan compliance every 6 hours and on certain events
async function startComplianceAutoScan(client) {
  if (!client.complianceEngine || !client.leagueMonitor) {
    console.warn('⚠️ Compliance auto-scan: Missing required managers — will retry shortly');
    setTimeout(() => startComplianceAutoScan(client), 1000);
    return;
  }

  // Run scan every 6 hours
  const SCAN_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

  setInterval(async () => {
    try {
      const settings = client.leagueMonitor.settings || (await loadSettings());
      const teams = client.leagueMonitor.teamManager?.teams || [];
      const transfers = client.leagueMonitor.transferManager?.transfers || [];
      const transferWindowOpen = settings.transferWindowOpen !== false;

      // Get primary guild (first guild)
      const guild = client.guilds.cache.first();
      if (!guild) {
        console.warn('⚠️ No guild found for compliance scan');
        return;
      }

      const result = await client.complianceEngine.runComplianceScan(
        teams,
        transfers,
        guild,
        settings,
        transferWindowOpen
      );

      const summary = client.complianceEngine.getSummary();

      // Log scan result
      console.log(`✅ Compliance scan completed: ${summary.totalViolations} violations detected`);

      // Alert if critical violations found
      if (summary.critical > 0) {
        const complianceChannel = guild.channels.cache.find(
          (c) => c.name === 'compliance-feed' || c.name === 'mod-logs' || c.name === 'admin-logs'
        );

        if (complianceChannel && complianceChannel.isTextBased()) {
          const { buildComplianceSummaryEmbed } = require('../utils/compliance');
          const embed = buildComplianceSummaryEmbed(summary);

          await complianceChannel.send({
            content: `🚨 **Critical Violations Detected** - ${summary.critical} critical issues found!`,
            embeds: [embed],
          });
        }
      }
    } catch (error) {
      console.error('❌ Compliance auto-scan error:', error);
    }
  }, SCAN_INTERVAL);

  console.log('✅ Compliance auto-scan started (every 6 hours)');
}

module.exports = {
  name: 'appReady',
  once: true,
  async execute(client) {
    await startComplianceAutoScan(client);
  },
};
