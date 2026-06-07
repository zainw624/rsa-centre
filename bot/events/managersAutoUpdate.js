const { buildManagersDashboardEmbed } = require('../utils/managers');

// Auto-update managers dashboard on role changes
async function setupManagersDashboardAutoUpdate(client) {
  if (!client.managersDashboard) {
    console.warn('⚠️ ManagersDashboard not initialized for auto-update — will retry shortly');
    setTimeout(() => setupManagersDashboardAutoUpdate(client), 1000);
    return;
  }

  // Update on role changes (when managers/assistants are added/removed)
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      // Check if leadership roles changed
      const managersDashboard = client.managersDashboard;
      if (!managersDashboard || managersDashboard.guildId !== newMember.guild.id) {
        return;
      }

      const guild = newMember.guild;
      const oldRoles = oldMember.roles.cache.map((r) => r.id);
      const newRoles = newMember.roles.cache.map((r) => r.id);

      // Check if any roles changed (simple comparison)
      if (oldRoles.length !== newRoles.length || oldRoles.some((r, i) => r !== newRoles[i])) {
        // Update leadership data
        const result = await managersDashboard.updateLeadership(guild);
        if (!result) return;

        // Update dashboard message if it exists
        if (managersDashboard.channelId && managersDashboard.messageId) {
          try {
            const channel = await guild.channels.fetch(managersDashboard.channelId);
            const message = await channel.messages.fetch(managersDashboard.messageId);
            const leadership = managersDashboard.getLeadership();
            const dashboardEmbed = buildManagersDashboardEmbed(leadership);

            await message.edit({ embeds: [dashboardEmbed] }).catch(() => null);

            console.log(`✅ Managers dashboard auto-updated for ${guild.name}`);
          } catch (error) {
            console.warn('⚠️ Could not auto-update managers dashboard:', error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in managers dashboard auto-update:', error);
    }
  });

  console.log('✅ Managers dashboard auto-update listener registered');
}

module.exports = {
  name: 'appReady',
  once: true,
  async execute(client) {
    await setupManagersDashboardAutoUpdate(client);
  },
};
