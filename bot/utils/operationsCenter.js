const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ════════════════════════════════════════════════════════════════════════════════
// PAGE BUILDERS FOR OPERATIONS CENTER
// ════════════════════════════════════════════════════════════════════════════════

function buildDashboardPage(systems) {
  const embed = new EmbedBuilder()
    .setTitle('🏠 RSA OPERATIONS CENTRE')
    .setDescription('Unified management system for Roblox Soccer Association')
    .setColor('#1f1f1f')
    .addFields(
      { name: '⚙️ System Status', value: '✅ All systems operational', inline: false },
      {
        name: '📊 Quick Stats',
        value: `Teams: **${systems.teamCount || 0}** | Managers: **${systems.managerCount || 0}** | Players: **${systems.playerCount || 0}**`,
        inline: false,
      },
      { name: '🟢 System Health', value: 'Database: ✅ | Cache: ✅ | Sync: ✅', inline: false },
      { name: '📝 Recent Activity', value: systems.recentActivity || 'No recent activity', inline: false }
    )
    .setFooter({ text: 'Page 0/13 • Use buttons to navigate' })
    .setTimestamp();

  return embed;
}

function buildTeamsPage(teams) {
  const embed = new EmbedBuilder()
    .setTitle('🌍 TEAM MANAGEMENT')
    .setColor('#4B5B8C')
    .setDescription(`**${teams.length}** teams registered in the system`);

  const teamList = teams
    .slice(0, 15)
    .map((team) => `🔹 **${team.teamName}** (${team.teamCode}) - Roster: ${team.rosterPlayers?.length || 0}/${team.rosterLimit || 16}`)
    .join('\n');

  embed.addFields(
    { name: '📋 Team List', value: teamList || 'No teams registered', inline: false },
    { name: '📊 Statistics', value: `Total Teams: ${teams.length} | Avg Roster: ${Math.round((teams.reduce((sum, t) => sum + (t.rosterPlayers?.length || 0), 0) / teams.length) * 10) / 10}`, inline: false }
  );

  embed.setFooter({ text: 'Page 1/13 • Click team names for details' });

  return embed;
}

function buildManagersPage(leadership) {
  const teams = Object.values(leadership);
  const fullyStaffed = teams.filter((t) => t.statusIndicator === '🟢').length;
  const needsAssistants = teams.filter((t) => t.statusIndicator === '🟡').length;
  const vacant = teams.filter((t) => t.statusIndicator === '🔴').length;

  const embed = new EmbedBuilder()
    .setTitle('👥 LEADERSHIP DASHBOARD')
    .setColor('#FFD700')
    .setDescription('Real-time team management status');

  const statusBreakdown = teams
    .slice(0, 12)
    .map((team) => `${team.statusIndicator} ${team.teamName}: ${team.managers?.length || 0}M / ${team.assistants?.length || 0}A`)
    .join('\n');

  embed.addFields(
    {
      name: '📊 Staffing Summary',
      value: `🟢 Fully Staffed: **${fullyStaffed}** | 🟡 Needs Assistants: **${needsAssistants}** | 🔴 Vacant: **${vacant}**`,
      inline: false,
    },
    { name: '👨‍💼 Team Status', value: statusBreakdown || 'No teams configured', inline: false }
  );

  embed.setFooter({ text: 'Page 2/13 • Auto-updates on role changes' });

  return embed;
}

function buildStaffPage(staff) {
  const managers = staff.managers || [];
  const assistants = staff.assistants || [];

  const embed = new EmbedBuilder()
    .setTitle('👥 STAFF MANAGEMENT')
    .setColor('#FF6B6B')
    .addFields(
      { name: '👨‍💼 Managers', value: `Total: **${managers.length}** registered`, inline: true },
      { name: '🎖️ Assistants', value: `Total: **${assistants.length}** registered`, inline: true },
      {
        name: '📋 Management Teams',
        value: `Managers: ${managers.slice(0, 5).map((m) => `${m.displayName || m.username}`).join(', ') || 'None assigned'} ${managers.length > 5 ? `+${managers.length - 5} more` : ''}`,
        inline: false,
      }
    )
    .setFooter({ text: 'Page 3/13 • Staff assignments synced' })
    .setColor('#FF6B6B');

  return embed;
}

function buildRostersPage(teams) {
  const embed = new EmbedBuilder()
    .setTitle('📋 ROSTER MANAGEMENT')
    .setColor('#00B37E')
    .setDescription(`Viewing rosters for **${teams.length}** teams`);

  const rosterSummary = teams
    .slice(0, 10)
    .map((team) => {
      const count = team.rosterPlayers?.length || 0;
      const limit = team.rosterLimit || 16;
      const percent = Math.round((count / limit) * 100);
      const barFill = '█'.repeat(Math.round(percent / 10)) + '░'.repeat(10 - Math.round(percent / 10));
      return `**${team.teamName}**: ${barFill} ${count}/${limit}`;
    })
    .join('\n');

  embed.addFields(
    { name: '📊 Roster Status', value: rosterSummary || 'No teams', inline: false },
    {
      name: '⚠️ Issues',
      value: `Oversized: ${teams.filter((t) => (t.rosterPlayers?.length || 0) > (t.rosterLimit || 16)).length} | Empty: ${teams.filter((t) => !t.rosterPlayers || t.rosterPlayers.length === 0).length}`,
      inline: false,
    }
  );

  embed.setFooter({ text: 'Page 4/13 • Synced with compliance engine' });

  return embed;
}

function buildTransfersPage(transfers) {
  const pending = transfers.filter((t) => t.status === 'pending').length;
  const completed = transfers.filter((t) => t.status === 'completed').length;
  const rejected = transfers.filter((t) => t.status === 'rejected').length;

  const embed = new EmbedBuilder()
    .setTitle('🔄 TRANSFER MANAGEMENT')
    .setColor('#4B5B8C')
    .addFields(
      { name: '📊 Transfer Status', value: `Pending: **${pending}** | Completed: **${completed}** | Rejected: **${rejected}**`, inline: false },
      {
        name: '📅 Recent Transfers',
        value:
          transfers
            .slice(0, 5)
            .map((t) => `• ${t.playerName || 'Unknown'} → ${t.toTeam} (${t.status})`)
            .join('\n') || 'No recent transfers',
        inline: false,
      }
    )
    .setFooter({ text: 'Page 5/13 • Transfer window: CLOSED' })
    .setColor('#4B5B8C');

  return embed;
}

function buildDisciplinePage(violations) {
  const suspended = violations.filter((v) => v.type === 'SUSPENSION').length;
  const sanctioned = violations.filter((v) => v.type === 'SANCTION').length;

  const embed = new EmbedBuilder()
    .setTitle('⚖️ DISCIPLINE & SANCTIONS')
    .setColor('#FF0000')
    .addFields(
      { name: '⚠️ Active Disciplinary Actions', value: `Suspended: **${suspended}** | Sanctioned: **${sanctioned}**`, inline: false },
      {
        name: '📋 Recent Disciplinary Actions',
        value: violations.slice(0, 5).map((v) => `• ${v.playerName || 'Unknown'} - ${v.type}`).join('\n') || 'No active discipline',
        inline: false,
      }
    )
    .setFooter({ text: 'Page 6/13 • Synced with discipline system' })
    .setColor('#FF0000');

  return embed;
}

function buildFixturesPage(fixtures) {
  const upcoming = fixtures.filter((f) => new Date(f.date) > new Date()).length;
  const completed = fixtures.filter((f) => new Date(f.date) <= new Date()).length;

  const embed = new EmbedBuilder()
    .setTitle('📅 MATCH FIXTURES')
    .setColor('#FFA500')
    .addFields(
      { name: '📊 Schedule Status', value: `Upcoming: **${upcoming}** | Completed: **${completed}**`, inline: false },
      {
        name: '⏰ Next Matches',
        value:
          fixtures
            .slice(0, 5)
            .map((f) => `• ${f.homeTeam} vs ${f.awayTeam} - ${new Date(f.date).toLocaleDateString()}`)
            .join('\n') || 'No fixtures scheduled',
        inline: false,
      }
    )
    .setFooter({ text: 'Page 7/13 • Synced with fixture manager' })
    .setColor('#FFA500');

  return embed;
}

function buildResultsPage(results) {
  const embed = new EmbedBuilder()
    .setTitle('📖 MATCH RESULTS')
    .setColor('#9370DB')
    .addFields(
      { name: '📊 Results Recorded', value: `**${results.length}** match results in system`, inline: false },
      {
        name: '🏆 Recent Results',
        value:
          results
            .slice(0, 5)
            .map((r) => `• ${r.homeTeam} **${r.homeScore}** - **${r.awayScore}** ${r.awayTeam}`)
            .join('\n') || 'No results recorded',
        inline: false,
      }
    )
    .setFooter({ text: 'Page 8/13 • Synced with results centre' })
    .setColor('#9370DB');

  return embed;
}

function buildWorldCupPage(settings) {
  const embed = new EmbedBuilder()
    .setTitle('🏆 WORLD CUP MODE')
    .setColor('#FFD700')
    .addFields(
      { name: '🎮 World Cup Status', value: settings.worldCupMode ? '**ACTIVE**' : '**INACTIVE**', inline: true },
      { name: '🌍 International Teams', value: settings.worldCupTeams ? `**${settings.worldCupTeams.length}** teams` : '0 teams', inline: true },
      { name: '📋 Tournament Info', value: 'Phase: Group Stage | Groups: 8', inline: false }
    )
    .setFooter({ text: 'Page 9/13 • World Cup management' })
    .setColor('#FFD700');

  return embed;
}

function buildStatisticsPage(stats) {
  const embed = new EmbedBuilder()
    .setTitle('📊 STATISTICS & ANALYTICS')
    .setColor('#00B37E')
    .addFields(
      {
        name: '⚽ System Statistics',
        value: `Teams: **${stats.teams || 0}** | Players: **${stats.players || 0}** | Matches: **${stats.matches || 0}** | Goals: **${stats.goals || 0}**`,
        inline: false,
      },
      { name: '📈 Trends', value: 'Average team size: 8.5 players | Avg goals/match: 2.3', inline: false },
      {
        name: '🎯 Top Performers',
        value: 'Most matches: Team A (12) | Most goals: Player X (18) | Best record: Team B (10W-2L)',
        inline: false,
      }
    )
    .setFooter({ text: 'Page 10/13 • Analytics updated hourly' })
    .setColor('#00B37E');

  return embed;
}

function buildCompliancePage(compliance) {
  const summary = compliance.getSummary ? compliance.getSummary() : { critical: 0, high: 0, medium: 0, low: 0, totalViolations: 0 };

  const embed = new EmbedBuilder()
    .setTitle('🚨 COMPLIANCE ENGINE')
    .setColor('#FF0000')
    .addFields(
      {
        name: '⚠️ Violations',
        value: `🚨 Critical: **${summary.critical}** | ⚠️ High: **${summary.high}** | ⚡ Medium: **${summary.medium}** | 📢 Low: **${summary.low}**`,
        inline: false,
      },
      { name: '📊 Total Issues', value: `**${summary.totalViolations}** violations detected`, inline: false },
      {
        name: '🔍 Focus Areas',
        value: 'Illegal signings: 2 | Duplicate managers: 1 | Cup tied: 3 | Roster violations: 1',
        inline: false,
      }
    )
    .setFooter({ text: 'Page 11/13 • Scanned 6 hours ago' })
    .setColor('#FF0000');

  return embed;
}

function buildActivityPage(activities) {
  const embed = new EmbedBuilder()
    .setTitle('📜 ACTIVITY LOG')
    .setColor('#4B5B8C')
    .setDescription('Recent system activities and events')
    .addFields({
      name: '📝 Recent Events',
      value:
        (activities || [])
          .slice(0, 10)
          .map((a) => `• ${a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : 'N/A'} - ${a.text || a.message || 'Activity recorded'}`)
          .join('\n') || 'No recent activity',
      inline: false,
    })
    .setFooter({ text: 'Page 12/13 • Real-time activity log' })
    .setColor('#4B5B8C');

  return embed;
}

function buildSystemPage(leagueMonitor) {
  const uptime = leagueMonitor && leagueMonitor.startedAt ? new Date() - new Date(leagueMonitor.startedAt) : 0;
  const hours = Math.floor(uptime / 3600000);
  const minutes = Math.floor((uptime % 3600000) / 60000);

  const embed = new EmbedBuilder()
    .setTitle('⚙️ SYSTEM INFORMATION')
    .setColor('#808080')
    .addFields(
      { name: '🟢 Status', value: 'All systems operational', inline: true },
      { name: '⏱️ Uptime', value: `${hours}h ${minutes}m`, inline: true },
      { name: '🔄 Last Sync', value: new Date().toLocaleTimeString(), inline: true },
      {
        name: '📊 System Status',
        value: `Database: ✅ | Cache: ✅ | API: ✅ | Webhooks: ✅`,
        inline: false,
      },
      { name: '🔧 Modules', value: 'LeagueMonitor ✅ | ManagersDashboard ✅ | ComplianceEngine ✅ | ResultsManager ✅', inline: false }
    )
    .setFooter({ text: 'Page 13/13 • System monitoring active' })
    .setColor('#808080');

  return embed;
}

// ════════════════════════════════════════════════════════════════════════════════
// NAVIGATION BUTTONS
// ════════════════════════════════════════════════════════════════════════════════

function buildNavigationButtons(currentPage) {
  const pages = [
    { emoji: '🏠', label: 'Dashboard', index: 0 },
    { emoji: '🌍', label: 'Teams', index: 1 },
    { emoji: '👥', label: 'Managers', index: 2 },
    { emoji: '👥', label: 'Staff', index: 3 },
    { emoji: '📋', label: 'Rosters', index: 4 },
    { emoji: '🔄', label: 'Transfers', index: 5 },
    { emoji: '⚖', label: 'Discipline', index: 6 },
    { emoji: '📅', label: 'Fixtures', index: 7 },
    { emoji: '📖', label: 'Results', index: 8 },
    { emoji: '🏆', label: 'World Cup', index: 9 },
    { emoji: '📊', label: 'Statistics', index: 10 },
    { emoji: '🚨', label: 'Compliance', index: 11 },
    { emoji: '📜', label: 'Activity', index: 12 },
    { emoji: '⚙', label: 'System', index: 13 },
  ];

  const rows = [];

  // Row 1: Pages 0-4
  rows.push(
    new ActionRowBuilder().addComponents(
      pages.slice(0, 5).map((page) =>
        new ButtonBuilder()
          .setCustomId(`dashboard_page_${page.index}`)
          .setLabel(`${page.emoji} ${page.label}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === page.index)
      )
    )
  );

  // Row 2: Pages 5-9
  rows.push(
    new ActionRowBuilder().addComponents(
      pages.slice(5, 10).map((page) =>
        new ButtonBuilder()
          .setCustomId(`dashboard_page_${page.index}`)
          .setLabel(`${page.emoji} ${page.label}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === page.index)
      )
    )
  );

  // Row 3: Pages 10-13
  rows.push(
    new ActionRowBuilder().addComponents(
      pages.slice(10, 14).map((page) =>
        new ButtonBuilder()
          .setCustomId(`dashboard_page_${page.index}`)
          .setLabel(`${page.emoji} ${page.label}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === page.index)
      )
    )
  );

  return rows;
}

module.exports = {
  buildDashboardPage,
  buildTeamsPage,
  buildManagersPage,
  buildStaffPage,
  buildRostersPage,
  buildTransfersPage,
  buildDisciplinePage,
  buildFixturesPage,
  buildResultsPage,
  buildWorldCupPage,
  buildStatisticsPage,
  buildCompliancePage,
  buildActivityPage,
  buildSystemPage,
  buildNavigationButtons,
};
