const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const { getActivityFeed } = require('./dashboardStorage');
const { getLeadershipStats } = require('./leadership');
const { getUpcomingFixtures } = require('./fixtures');

const TEAMS_PAGE_1 = ['Belgium', 'Brazil', 'Croatia', 'England', 'France', 'Germany', 'Ghana', 'Japan'];
const TEAMS_PAGE_2 = ['Morocco', 'Netherlands', 'Norway', 'Senegal', 'Spain', 'Sweden', 'Türkiye', 'USA'];

/**
 * Get team logo attachment
 */
async function getTeamLogoAttachment(teamName, fallbackLogoPath) {
  try {
    const logoName = teamName.toLowerCase().replace(/ü/g, 'u').replace(/ç/g, 'c');
    const logoPath = path.join(__dirname, '..', 'assets', `${logoName}.png`);

    try {
      await fs.access(logoPath);
      return new AttachmentBuilder(logoPath, { name: `${logoName}.png` });
    } catch {
      // Logo not found, use RSA logo as fallback
      if (fallbackLogoPath) {
        return new AttachmentBuilder(fallbackLogoPath, { name: 'rsa-fallback.png' });
      }
      return null;
    }
  } catch (error) {
    console.error('Error getting team logo:', error);
    return null;
  }
}

/**
 * Get RSA logo attachment
 */
async function getRSALogoAttachment() {
  const rsaLogoPath = path.join(__dirname, '..', 'assets', 'rsa1.png');
  try {
    await fs.access(rsaLogoPath);
    return new AttachmentBuilder(rsaLogoPath, { name: 'rsa1.png' });
  } catch {
    return null;
  }
}

/**
 * Build the dashboard embed for a specific page
 */
async function buildDashboardEmbed(leadership, page = 0, rsaLogoUrl = null, transferWindowOpen = false, worldCupMode = false) {
  try {
    const teamsForPage = page === 0 ? TEAMS_PAGE_1 : TEAMS_PAGE_2;
    const stats = getLeadershipStats(leadership);
    const activityFeed = await getActivityFeed(5);
    const upcomingFixtures = await getUpcomingFixtures(4);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'RSA National Team Management System',
        ...(rsaLogoUrl ? { iconURL: rsaLogoUrl } : {}),
      })
      .setTitle(`🌍 RSA National Team Leadership Dashboard`)
      .setDescription(
        'Official RSA National Team Leadership Dashboard\n' +
          'Live Leadership Tracking • Automatically Updated'
      )
      .setColor('#1f1f1f')
      .setFooter({
        text: 'RSA National Team Management System • Leadership Monitoring Active',
        ...(rsaLogoUrl ? { iconURL: rsaLogoUrl } : {}),
      })
      .setTimestamp();

    // Build team cards
    let teamFieldValue = '';
    for (const teamName of teamsForPage) {
      const team = leadership[teamName];
      if (!team) continue;

      const managerDisplay = team.managers.length > 0 ? team.managers[0].mention : 'Vacant';
      const assistantDisplay = team.assistants.length > 0 ? team.assistants[0].mention : 'Vacant';

      teamFieldValue += `\n${team.statusIndicator} **${teamName}**\n`;
      teamFieldValue += `Status: ${team.status}\n`;
      teamFieldValue += `Manager: ${managerDisplay}\n`;
      teamFieldValue += `Assistant: ${assistantDisplay}\n`;
      teamFieldValue += `Last Updated: <t:${Math.floor(new Date(team.lastUpdated).getTime() / 1000)}:R>\n`;
    }

    embed.addFields({
      name: `📋 Teams (Page ${page + 1}/2)`,
      value: teamFieldValue || 'No team data available',
      inline: false,
    });

    // Statistics section
    embed.addFields(
      {
        name: '📊 Leadership Statistics',
        value:
          `📊 Total Teams: \`${stats.totalTeams}\`\n` +
          `👤 Active Managers: \`${stats.activeManagers}\`\n` +
          `👤 Active Assistants: \`${stats.activeAssistants}\`\n` +
          `🔴 Vacant Teams: \`${stats.vacantTeams}\`\n` +
          `🟡 Need Assistants: \`${stats.teamsNeedingAssistants}\`\n` +
          `🚨 Active Conflicts: \`${stats.activeConflicts}\``,
        inline: false,
      },
      {
        name: '📅 Upcoming Fixtures',
        value:
          upcomingFixtures.length > 0
            ? upcomingFixtures
                .map(
                  (fixture) =>
                    `• **${fixture.homeTeam} vs ${fixture.awayTeam}** · ${fixture.competition} · <t:${Math.floor(
                      new Date(fixture.kickoff).getTime() / 1000
                    )}:f>`
                )
                .join('\n')
            : 'No upcoming fixtures scheduled.',
        inline: false,
      },
      {
        name: '📡 System Status',
        value:
          `🟢 Dashboard: Online\n` +
          `🟢 Team Scanning: Active\n` +
          `🟢 Leadership Monitoring: Active\n` +
          `🔓 Transfer Window: ${transferWindowOpen ? 'Open' : 'Closed'}\n` +
          `🏆 World Cup Mode: ${worldCupMode ? 'Enabled' : 'Disabled'}\n` +
          `🕒 Last Updated: <t:${Math.floor(Date.now() / 1000)}:R>`,
        inline: false,
      }
    );

    // Activity feed
    if (activityFeed.length > 0) {
      embed.addFields({
        name: '📢 Recent Activity',
        value: activityFeed.join('\n') || 'No recent activity',
        inline: false,
      });
    }

    return embed;
  } catch (error) {
    console.error('Error building dashboard embed:', error);
    throw error;
  }
}

/**
 * Build control buttons for pagination and refresh
 */
function buildControlButtons(page = 0) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('dashboard-prev')
      .setLabel('◀ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId('dashboard-refresh')
      .setLabel('🔄 Refresh')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('dashboard-next')
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 1)
  );

  return row;
}

/**
 * Send dashboard to channel
 */
async function sendDashboard(channel, leadership, page = 0, rsaLogoUrl = null, transferWindowOpen = false, worldCupMode = false) {
  try {
    const embed = await buildDashboardEmbed(leadership, page, rsaLogoUrl, transferWindowOpen, worldCupMode);
    const buttons = buildControlButtons(page);

    const message = await channel.send({
      embeds: [embed],
      components: [buttons],
    });

    return message;
  } catch (error) {
    console.error('Error sending dashboard:', error);
    throw error;
  }
}

/**
 * Update existing dashboard message
 */
async function updateDashboard(message, leadership, page = 0, rsaLogoUrl = null, transferWindowOpen = false, worldCupMode = false) {
  try {
    const embed = await buildDashboardEmbed(leadership, page, rsaLogoUrl, transferWindowOpen, worldCupMode);
    const buttons = buildControlButtons(page);

    await message.edit({
      embeds: [embed],
      components: [buttons],
    });

    return message;
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
}

module.exports = {
  buildDashboardEmbed,
  buildControlButtons,
  sendDashboard,
  updateDashboard,
  getTeamLogoAttachment,
  getRSALogoAttachment,
  TEAMS_PAGE_1,
  TEAMS_PAGE_2,
};
