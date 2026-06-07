const { EmbedBuilder } = require('discord.js');

function buildManagersEmbed(team, logo = null) {
  const emoji = team.statusIndicator || '⚪';
  const statusColor = {
    '🟢': '#00B37E',
    '🟡': '#FFD700',
    '🟠': '#FFA500',
    '🔴': '#FF0000',
    '⚪': '#808080',
  }[emoji] || '#4B5B8C';

  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${team.teamName}`)
    .setDescription(`**Code:** ${team.teamCode}`)
    .setColor(statusColor)
    .addFields({ name: '📊 Status', value: team.status || 'Unknown', inline: false });

  // Manager information
  if (team.managers && team.managers.length > 0) {
    const managersList = team.managers.map((m) => `👤 ${m.mention || m.displayName || m.username}`).join('\n');
    embed.addFields({ name: '🔑 Manager' + (team.managers.length > 1 ? 's' : ''), value: managersList, inline: false });
  } else {
    embed.addFields({ name: '🔑 Manager', value: '❌ Unassigned', inline: false });
  }

  // Assistant information
  if (team.assistants && team.assistants.length > 0) {
    const assistantsList = team.assistants.map((a) => `🎖️ ${a.mention || a.displayName || a.username}`).join('\n');
    embed.addFields({ name: '🎖️ Assistant' + (team.assistants.length > 1 ? 's' : ''), value: assistantsList, inline: false });
  } else {
    embed.addFields({ name: '🎖️ Assistant', value: '❌ Unassigned', inline: false });
  }

  // Vacancy indicator
  const vacancyStatus = team.managers.length === 0 || team.assistants.length === 0 ? '⚠️ Positions Open' : '✅ Fully Staffed';
  embed.addFields({ name: '💼 Vacancy', value: vacancyStatus, inline: true });

  embed.setFooter({ text: 'RSA | Leadership Dashboard' });
  embed.setTimestamp();

  if (logo) {
    embed.setThumbnail(logo);
  }

  return embed;
}

function buildManagersDashboardEmbed(leadership) {
  const teams = Object.values(leadership);

  const embed = new EmbedBuilder()
    .setTitle('🔑 RSA LEADERSHIP DASHBOARD')
    .setDescription('Live team management overview — automatically updated')
    .setColor('#1f1f1f');

  // Summary stats
  const fullyStaffed = teams.filter((t) => t.statusIndicator === '🟢').length;
  const needingAssistants = teams.filter((t) => t.statusIndicator === '🟡').length;
  const multipleManagers = teams.filter((t) => t.statusIndicator === '🟠').length;
  const vacant = teams.filter((t) => t.statusIndicator === '🔴').length;

  embed.addFields(
    { name: '🟢 Fully Staffed', value: fullyStaffed.toString(), inline: true },
    { name: '🟡 Needs Assistants', value: needingAssistants.toString(), inline: true },
    { name: '🔴 Vacant', value: vacant.toString(), inline: true },
    { name: '🟠 Issues', value: multipleManagers.toString(), inline: true }
  );

  // Team count
  embed.addFields({ name: '📊 Total Teams', value: teams.length.toString(), inline: true });

  // Quick status overview
  const vacantTeams = teams.filter((t) => t.statusIndicator === '🔴').map((t) => `${t.teamName}`);
  if (vacantTeams.length > 0) {
    embed.addFields({
      name: '⚠️ Vacant Positions',
      value: vacantTeams.slice(0, 5).join(', ') + (vacantTeams.length > 5 ? ` +${vacantTeams.length - 5} more` : ''),
      inline: false,
    });
  }

  embed.setFooter({ text: 'View team details with /managers view' });
  embed.setTimestamp();

  return embed;
}

function buildLeadershipSummaryEmbed(summary) {
  const embed = new EmbedBuilder()
    .setTitle('📊 Leadership Summary')
    .setColor('#1f1f1f')
    .addFields(
      { name: '✅ Fully Staffed Teams', value: summary.fullyStaffed.toString(), inline: true },
      { name: '🟡 Needing Assistants', value: summary.needingAssistants.toString(), inline: true },
      { name: '🔴 Vacant Teams', value: summary.vacant.toString(), inline: true },
      { name: '👥 Total Managers', value: summary.totalManagers.toString(), inline: true },
      { name: '🎖️ Total Assistants', value: summary.totalAssistants.toString(), inline: true },
      { name: '📈 Staffing Rate', value: `${((summary.fullyStaffed / summary.totalTeams) * 100).toFixed(1)}%`, inline: true }
    )
    .setFooter({ text: `Last updated: ${new Date(summary.lastUpdated).toLocaleString()}` })
    .setTimestamp();

  return embed;
}

function buildVacancyEmbed(vacantTeams) {
  const embed = new EmbedBuilder()
    .setTitle('⚠️ Vacant Positions')
    .setDescription(`${vacantTeams.length} team(s) need leadership`)
    .setColor('#FF0000');

  if (vacantTeams.length === 0) {
    embed.setDescription('✅ No vacant positions!').setColor('#00B37E');
    return embed;
  }

  for (const team of vacantTeams.slice(0, 10)) {
    const positions = [];
    if (!team.managers || team.managers.length === 0) positions.push('Manager');
    if (!team.assistants || team.assistants.length === 0) positions.push('Assistant');

    embed.addFields({
      name: `${team.teamName} (${team.teamCode})`,
      value: `Needs: ${positions.join(', ')}`,
      inline: false,
    });
  }

  if (vacantTeams.length > 10) {
    embed.addFields({ name: 'And More', value: `${vacantTeams.length - 10} more teams need leadership`, inline: false });
  }

  embed.setFooter({ text: 'Use /managers assign to fill positions' });

  return embed;
}

module.exports = {
  buildManagersEmbed,
  buildManagersDashboardEmbed,
  buildLeadershipSummaryEmbed,
  buildVacancyEmbed,
};
