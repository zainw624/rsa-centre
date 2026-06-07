const fs = require('fs');
const path = require('path');
const { ChannelType } = require('discord.js');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    try {
      const client = message.client;

      // Check if this is the operations centre dashboard message
      if (!client.operationsCenter) {
        console.warn('[Operations Centre] OperationsCenter not initialized for messageDelete — will retry shortly');
        setTimeout(() => module.exports.execute(message), 1000);
        return;
      }

      const dashboardInfo = client.operationsCenter.getDashboardInfo();

      if (
        dashboardInfo.messageId === message.id &&
        dashboardInfo.channelId === message.channelId &&
        dashboardInfo.guildId === message.guildId
      ) {
        try {
          console.log('[Operations Centre] Dashboard message deleted, auto-recreating...');

          // Get the guild
          const guild = client.guilds.cache.get(dashboardInfo.guildId);
          if (!guild) {
            console.error('[Operations Centre] Guild not found for auto-recreation');
            return;
          }

          // Get the channel
          const channel = guild.channels.cache.get(dashboardInfo.channelId);
          if (!channel) {
            console.error('[Operations Centre] Channel not found for auto-recreation');
            return;
          }

          // Build the page embed
          const currentPage = client.operationsCenter.getCurrentPage();
          const pageEmbed = await client.operationsCenter.buildPage(currentPage, client);
          const navigationButtons = client.operationsCenter.getNavigationButtons(currentPage);

          // Create new message
          const rsaPath = path.join(process.cwd(), 'assets', 'rsa1.png');
          const filesToSend = [];
          if (fs.existsSync(rsaPath)) {
            filesToSend.push(rsaPath);
          }

          const sendPayload = {
            embeds: [pageEmbed],
            components: navigationButtons,
          };
          if (filesToSend.length) sendPayload.files = filesToSend;

          const newMessage = await channel.send(sendPayload).catch((err) => {
            console.error('[Operations Centre] Error sending new dashboard message:', err.message);
            return null;
          });

          if (!newMessage) {
            console.error('[Operations Centre] Failed to create new dashboard message');
            return;
          }

          // Update dashboard info
          await client.operationsCenter.setDashboardInfo(dashboardInfo.guildId, dashboardInfo.channelId, newMessage.id);

          client.operationsCenter.logActivity('🔄 Dashboard auto-recreated after deletion');

          console.log(`[Operations Centre] Dashboard auto-recreated with new message ID: ${newMessage.id}`);
        } catch (error) {
          console.error('[Operations Centre] Error auto-recreating dashboard:', error.message);
        }
      }
    } catch (error) {
      console.error('[Operations Centre] Unexpected error in messageDelete handler:', error);
    }
  },
};
