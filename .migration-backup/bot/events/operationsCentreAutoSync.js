// Auto-sync handler for Operations Centre
// Updates dashboard when systems change

module.exports = {
  name: 'appReady',
  once: true, // Only run once on appReady
  async execute(client) {
    console.log('[Operations Centre] Setting up auto-sync system...');

    if (!client.operationsCenter) {
      console.warn('[Operations Centre] OperationsCenter not initialized — will retry shortly');
      setTimeout(() => module.exports.execute(client), 1000);
      return;
    }

    // Auto-sync every 5 minutes
    const syncInterval = setInterval(async () => {
      try {
        const dashboardInfo = client.operationsCenter.getDashboardInfo();

        if (!dashboardInfo.messageId || !dashboardInfo.channelId) {
          return; // Dashboard not deployed yet
        }

        // Get the guild and channel
        const guild = client.guilds.cache.get(dashboardInfo.guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(dashboardInfo.channelId);
        if (!channel) return;

        // Try to fetch the message
        const message = await channel.messages.fetch(dashboardInfo.messageId).catch(() => null);
        if (!message) {
          // Message was deleted, let messageDelete event handle recreation
          return;
        }

        // Build the current page
        const currentPage = client.operationsCenter.getCurrentPage();
        const pageEmbed = await client.operationsCenter.buildPage(currentPage, client);
        const navigationButtons = client.operationsCenter.getNavigationButtons(currentPage);

        // Update the message
        await message.edit({
          embeds: [pageEmbed],
          components: navigationButtons,
        }).catch((err) => {
          console.error('[Operations Centre] Error updating dashboard message:', err.message);
        });
      } catch (error) {
        console.error('[Operations Centre] Auto-sync error:', error.message);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Store interval ID for potential cleanup
    client.operationsCenterSyncInterval = syncInterval;

    // Listen for manager/staff role changes - trigger immediate sync
    client.on('guildMemberUpdate', async (oldMember, newMember) => {
      try {
        if (!client.operationsCenter) return;

        const dashboardInfo = client.operationsCenter.getDashboardInfo();
        if (dashboardInfo.guildId !== newMember.guild.id) return;

        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;

        // Check if roles actually changed
        if (oldRoles.size !== newRoles.size || oldRoles.some((role) => !newRoles.has(role.id))) {
          // Log the activity
          client.operationsCenter.logActivity(
            `👤 Role update: ${newMember.user.username}`
          );

          // Optionally trigger immediate dashboard update on critical roles
          const criticalRoles = ['RSA | Managers', 'RSA | Assistant Managers', 'RSA | Officials'];
          const hasCriticalChange = Array.from(oldRoles.values())
            .some((role) => criticalRoles.includes(role.name)) ||
            Array.from(newRoles.values())
            .some((role) => criticalRoles.includes(role.name));

          if (hasCriticalChange) {
            // Trigger dashboard update after a short delay
            setTimeout(async () => {
              try {
                const dashInfo = client.operationsCenter.getDashboardInfo();
                if (!dashInfo.messageId) return;

                const gld = client.guilds.cache.get(dashInfo.guildId);
                const chl = gld?.channels.cache.get(dashInfo.channelId);
                const msg = await chl?.messages.fetch(dashInfo.messageId).catch(() => null);

                if (msg) {
                  const currentPage = client.operationsCenter.getCurrentPage();
                  const embed = await client.operationsCenter.buildPage(currentPage, client);
                  const buttons = client.operationsCenter.getNavigationButtons(currentPage);
                  await msg.edit({ embeds: [embed], components: buttons }).catch(() => null);
                }
              } catch (err) {
                // Silently fail - next sync will catch up
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('[Operations Centre] Error handling member role update:', error.message);
      }
    });

    console.log('[Operations Centre] Auto-sync system ready');
  },
};
