const { loadDashboard, saveDashboard, addActivityEvent } = require('../utils/dashboardStorage');
const { scanLeadership } = require('../utils/leadership');
const { updateDashboard } = require('../utils/dashboard');
const { loadSettings } = require('../utils/settings');
const { loadTeams } = require('../utils/teams');
const { loadTransferWindow } = require('../utils/transferWindow');

let updateCooldown = 0;
const COOLDOWN_MS = 5000; // Wait 5 seconds between updates to batch changes

/**
 * Schedule a dashboard update
 */
async function scheduleDashboardUpdate(guild) {
  const now = Date.now();
  if (now - updateCooldown < COOLDOWN_MS) {
    return; // Still in cooldown
  }

  updateCooldown = now;

  try {
    const dashboard = await loadDashboard();

    // Check if dashboard exists for this guild
    if (dashboard.guildId !== guild.id || !dashboard.channelId || !dashboard.messageId) {
      return; // Dashboard not initialized for this guild
    }

    // Fetch the dashboard message
    const channel = await guild.channels.fetch(dashboard.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      console.warn('Dashboard channel not found or deleted, marking for recreation');
      dashboard.channelId = null;
      dashboard.messageId = null;
      await saveDashboard(dashboard);
      return;
    }

    const message = await channel.messages.fetch(dashboard.messageId).catch(() => null);
    if (!message) {
      console.warn('Dashboard message not found, recreating...');
      // Message was deleted, recreate it
      const { leadership } = await scanLeadership(guild);
      const newMessage = await channel.send({
        embeds: [],
        components: [],
      });

      dashboard.messageId = newMessage.id;
      dashboard.lastUpdated = new Date().toISOString();
      await saveDashboard(dashboard);

      await addActivityEvent({
        emoji: '📊',
        text: 'Dashboard Recreated',
        type: 'dashboardRecreated',
      });

      return;
    }

    // Scan leadership
    const { leadership, conflicts } = await scanLeadership(guild);

    const transferWindowOpen = await loadTransferWindow();
    const settings = await loadSettings();
    const worldCupMode = settings.worldCupMode || false;
    // Update the dashboard
    const currentPage = dashboard.currentPage || 0;
    await updateDashboard(message, leadership, currentPage, null, transferWindowOpen, worldCupMode);

    // Update timestamp
    dashboard.lastUpdated = new Date().toISOString();
    await saveDashboard(dashboard);

    // Log conflicts
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        console.warn('⚠️ Leadership Conflict Detected:', {
          type: conflict.type,
          member: conflict.member.displayName,
          teams: conflict.teams,
        });

        await addActivityEvent({
          emoji: '🚨',
          text: `Leadership Conflict: ${conflict.member.displayName}`,
          type: 'conflictDetected',
          conflictType: conflict.type,
        });
      }
    }
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

/**
 * Track previous leadership state to detect changes
 */
let previousLeadership = {};

/**
 * Compare and log leadership changes
 */
async function detectLeadershipChanges(guild, newLeadership) {
  try {
    const settings = await loadSettings();

    for (const teamName in newLeadership) {
      const newTeam = newLeadership[teamName];
      const prevTeam = previousLeadership[teamName];

      if (!prevTeam) continue;

      // Check for manager changes
      if (newTeam.managers.length > prevTeam.managers.length) {
        const newManager = newTeam.managers.find(
          (m) => !prevTeam.managers.some((pm) => pm.userId === m.userId)
        );
        if (newManager) {
          await addActivityEvent({
            emoji: '🟢',
            text: `${teamName} Manager Assigned: ${newManager.displayName}`,
            type: 'managerAssigned',
            team: teamName,
            manager: newManager,
          });
        }
      } else if (newTeam.managers.length < prevTeam.managers.length) {
        const removedManager = prevTeam.managers.find(
          (m) => !newTeam.managers.some((nm) => nm.userId === m.userId)
        );
        if (removedManager) {
          await addActivityEvent({
            emoji: '🔴',
            text: `${teamName} Manager Removed: ${removedManager.displayName}`,
            type: 'managerRemoved',
            team: teamName,
            manager: removedManager,
          });
        }
      }

      // Check for assistant changes
      if (newTeam.assistants.length > prevTeam.assistants.length) {
        const newAssistant = newTeam.assistants.find(
          (a) => !prevTeam.assistants.some((pa) => pa.userId === a.userId)
        );
        if (newAssistant) {
          await addActivityEvent({
            emoji: '🟢',
            text: `${teamName} Assistant Assigned: ${newAssistant.displayName}`,
            type: 'assistantAssigned',
            team: teamName,
            assistant: newAssistant,
          });
        }
      } else if (newTeam.assistants.length < prevTeam.assistants.length) {
        const removedAssistant = prevTeam.assistants.find(
          (a) => !newTeam.assistants.some((na) => na.userId === a.userId)
        );
        if (removedAssistant) {
          await addActivityEvent({
            emoji: '🔴',
            text: `${teamName} Assistant Removed: ${removedAssistant.displayName}`,
            type: 'assistantRemoved',
            team: teamName,
            assistant: removedAssistant,
          });
        }
      }

      // Check for status changes
      if (newTeam.status !== prevTeam.status) {
        await addActivityEvent({
          emoji: newTeam.statusIndicator,
          text: `${teamName}: ${newTeam.status}`,
          type: 'statusChanged',
          team: teamName,
          newStatus: newTeam.status,
          oldStatus: prevTeam.status,
        });
      }
    }

    previousLeadership = newLeadership;
  } catch (error) {
    console.error('Error detecting leadership changes:', error);
  }
}

module.exports = [
  {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
      await scheduleDashboardUpdate(newMember.guild);
    },
  },
  {
    name: 'guildMemberAdd',
    async execute(member) {
      await scheduleDashboardUpdate(member.guild);
    },
  },
  {
    name: 'guildMemberRemove',
    async execute(member) {
      await scheduleDashboardUpdate(member.guild);
    },
  },
  {
    name: 'roleCreate',
    async execute(role) {
      await scheduleDashboardUpdate(role.guild);
    },
  },
  {
    name: 'roleDelete',
    async execute(role) {
      await scheduleDashboardUpdate(role.guild);
    },
  },
  {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
      await scheduleDashboardUpdate(newRole.guild);
    },
  },
  {
    name: 'appReady',
    once: true,
    async execute(client) {
      console.log('✅ Dashboard monitoring system initialized');

      // Initialize dashboard for each guild
      for (const guild of client.guilds.cache.values()) {
        const dashboard = await loadDashboard();
        if (dashboard.guildId === guild.id) {
          await scheduleDashboardUpdate(guild);
        }
      }
    },
  },
];

module.exports.scheduleDashboardUpdate = scheduleDashboardUpdate;
