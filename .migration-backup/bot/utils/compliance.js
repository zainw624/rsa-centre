const { EmbedBuilder } = require('discord.js');

const VIOLATION_COLORS = {
  DUPLICATE_MANAGER: '#FF6B6B',
  DUPLICATE_ASSISTANT: '#FFA500',
  ILLEGAL_SIGNING: '#FF0000',
  CUP_TIED_VIOLATION: '#FF0000',
  TRANSFER_WINDOW_VIOLATION: '#FF6B6B',
  MISSING_MANAGER: '#FFD700',
  MISSING_ASSISTANTS: '#FFA500',
  ROSTER_OVERSIZED: '#FF8C00',
  DUPLICATE_ROSTER_ENTRY: '#FF0000',
  PLAYER_MULTIPLE_TEAMS: '#FF0000',
};

const SEVERITY_EMOJI = {
  CRITICAL: '🚨',
  HIGH: '⚠️',
  MEDIUM: '⚡',
  LOW: '⚡',
};

const VIOLATION_TITLES = {
  DUPLICATE_MANAGER: 'Duplicate Manager Detected',
  DUPLICATE_ASSISTANT: 'Duplicate Assistant Detected',
  ILLEGAL_SIGNING: 'Illegal Signing Detected',
  CUP_TIED_VIOLATION: 'Cup Tied Violation',
  TRANSFER_WINDOW_VIOLATION: 'Transfer Window Violation',
  MISSING_MANAGER: 'Missing Manager',
  MISSING_ASSISTANTS: 'Missing Assistants',
  ROSTER_OVERSIZED: 'Oversized Roster',
  DUPLICATE_ROSTER_ENTRY: 'Duplicate Roster Entry',
  PLAYER_MULTIPLE_TEAMS: 'Player on Multiple Teams',
};

function buildComplianceSummaryEmbed(summary) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Compliance Report Summary')
    .setColor('#1f1f1f')
    .addFields(
      { name: '🚨 Critical Violations', value: summary.critical.toString(), inline: true },
      { name: '⚠️ High Priority', value: summary.high.toString(), inline: true },
      { name: '⚡ Medium Priority', value: summary.medium.toString(), inline: true },
      { name: '📊 Total Violations', value: summary.totalViolations.toString(), inline: false },
      { name: '🔔 Active Warnings', value: summary.activeWarnings.toString(), inline: true }
    )
    .setFooter({ text: `Last Scan: ${new Date(summary.lastScan).toLocaleString()}` })
    .setTimestamp();

  // Add violation breakdown
  if (Object.keys(summary.violationsByType).length > 0) {
    const typeBreakdown = Object.entries(summary.violationsByType)
      .map(([type, count]) => `${VIOLATION_TITLES[type] || type}: **${count}**`)
      .join('\n');

    embed.addFields({ name: '📌 Violation Breakdown', value: typeBreakdown, inline: false });
  }

  return embed;
}

function buildComplianceWarningEmbed(violation) {
  const emoji = SEVERITY_EMOJI[violation.severity] || '⚡';
  const color = VIOLATION_COLORS[violation.type] || '#FFA500';
  const title = VIOLATION_TITLES[violation.type] || violation.type;

  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${title}`)
    .setDescription(violation.message)
    .setColor(color)
    .addFields({ name: '⏱️ Detected', value: new Date(violation.timestamp).toLocaleString(), inline: true })
    .addFields({ name: '📍 Severity', value: violation.severity, inline: true });

  // Add type-specific fields
  if (violation.type === 'DUPLICATE_MANAGER') {
    embed.addFields({ name: '👥 Teams Affected', value: violation.teams.join(', '), inline: false });
  } else if (violation.type === 'DUPLICATE_ASSISTANT') {
    embed.addFields({ name: '👥 Teams Affected', value: violation.teams.join(', '), inline: false });
  } else if (violation.type === 'ILLEGAL_SIGNING') {
    embed.addFields(
      { name: '👤 Player', value: `<@${violation.playerId}> (${violation.playerName})`, inline: true },
      { name: '🏆 Team', value: violation.team, inline: true }
    );
  } else if (violation.type === 'CUP_TIED_VIOLATION') {
    embed.addFields(
      { name: '👤 Player', value: `<@${violation.playerId}> (${violation.playerName})`, inline: true },
      { name: '🏆 Team', value: violation.team, inline: true }
    );
  } else if (violation.type === 'TRANSFER_WINDOW_VIOLATION') {
    embed.addFields(
      { name: '👤 Player', value: `<@${violation.playerId}> (${violation.playerName})`, inline: true },
      { name: '🏆 Team', value: violation.team, inline: true }
    );
  } else if (violation.type === 'MISSING_MANAGER' || violation.type === 'MISSING_ASSISTANTS') {
    embed.addFields({ name: '🏆 Team', value: violation.team, inline: true });
  } else if (violation.type === 'ROSTER_OVERSIZED') {
    embed.addFields(
      { name: '🏆 Team', value: violation.team, inline: true },
      { name: '📊 Current/Limit', value: `${violation.current}/${violation.limit}`, inline: true }
    );
  } else if (violation.type === 'DUPLICATE_ROSTER_ENTRY') {
    embed.addFields(
      { name: '🏆 Team', value: violation.team, inline: true },
      { name: '👤 Player', value: `<@${violation.playerId}>`, inline: true },
      { name: '🔢 Occurrences', value: violation.count.toString(), inline: true }
    );
  } else if (violation.type === 'PLAYER_MULTIPLE_TEAMS') {
    embed.addFields(
      { name: '👤 Player', value: `<@${violation.playerId}>`, inline: true },
      { name: '👥 Teams', value: violation.teams.join(', '), inline: false }
    );
  }

  embed.setFooter({ text: 'RSA | Compliance Engine' });

  return embed;
}

function buildComplianceFeedEmbed(violations, page = 0, pageSize = 5) {
  const totalPages = Math.ceil(violations.length / pageSize);
  const startIndex = page * pageSize;
  const pageViolations = violations.slice(startIndex, startIndex + pageSize);

  if (violations.length === 0) {
    return new EmbedBuilder()
      .setTitle('✅ No Violations Found')
      .setDescription('All systems are in compliance!')
      .setColor('#00B37E')
      .setFooter({ text: 'RSA | Compliance Engine' })
      .setTimestamp();
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Compliance Feed')
    .setColor('#1f1f1f')
    .setFooter({ text: `Page ${page + 1}/${totalPages} | ${violations.length} total violations` })
    .setTimestamp();

  for (const violation of pageViolations) {
    const emoji = SEVERITY_EMOJI[violation.severity] || '⚡';
    const title = VIOLATION_TITLES[violation.type] || violation.type;
    const date = new Date(violation.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    embed.addFields({
      name: `${emoji} ${title}`,
      value: `${violation.message}\n*${date}*`,
      inline: false,
    });
  }

  return embed;
}

function buildResolutionGuideEmbed(violationType) {
  const guides = {
    DUPLICATE_MANAGER: {
      title: '🔧 Fix: Duplicate Manager',
      steps: [
        '1. Identify which team needs the manager',
        '2. Use `/staffcentre manager remove` to remove from other teams',
        '3. Use `/staffcentre manager assign` to assign to correct team',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    DUPLICATE_ASSISTANT: {
      title: '🔧 Fix: Duplicate Assistant',
      steps: [
        '1. Identify which teams need this assistant',
        '2. Use `/staffcentre assistant remove` to remove from extra teams',
        '3. Keep only on essential team(s)',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    ILLEGAL_SIGNING: {
      title: '🔧 Fix: Illegal Signing',
      steps: [
        '1. Create a transfer record using `/sign` command',
        '2. Ensure proper authorization from team manager',
        '3. Record transfer in system with all details',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    CUP_TIED_VIOLATION: {
      title: '🔧 Fix: Cup Tied Violation',
      steps: [
        '1. Remove cup tied role from player if status changed',
        '2. Use `/release` to remove player from roster',
        '3. Or use `/sanction` to properly handle the situation',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    TRANSFER_WINDOW_VIOLATION: {
      title: '🔧 Fix: Transfer Window Violation',
      steps: [
        '1. Review transfer details and date',
        '2. If error, record correction transfer',
        '3. Document reason in transfer notes',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    MISSING_MANAGER: {
      title: '🔧 Fix: Missing Manager',
      steps: [
        '1. Recruit a manager for the team',
        '2. Use `/staffcentre manager assign` to assign manager',
        '3. Verify manager has appropriate permissions',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    MISSING_ASSISTANTS: {
      title: '🔧 Fix: Missing Assistants',
      steps: [
        '1. Recruit assistant(s) for the team',
        '2. Use `/staffcentre assistant assign` to add assistants',
        '3. At least one assistant recommended',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    ROSTER_OVERSIZED: {
      title: '🔧 Fix: Oversized Roster',
      steps: [
        '1. Review roster members',
        '2. Use `/release` to remove excess players',
        '3. Ensure roster does not exceed limit',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    DUPLICATE_ROSTER_ENTRY: {
      title: '🔧 Fix: Duplicate Roster Entry',
      steps: [
        '1. Identify duplicate player entry',
        '2. Remove one of the duplicate entries',
        '3. Verify player appears only once in roster',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
    PLAYER_MULTIPLE_TEAMS: {
      title: '🔧 Fix: Player on Multiple Teams',
      steps: [
        '1. Determine which team is correct',
        '2. Use `/release` to remove player from other teams',
        '3. Process proper transfer if moving teams',
        '4. Re-run compliance scan with `/compliance scan`',
      ],
    },
  };

  const guide = guides[violationType] || {
    title: '🔧 General Resolution',
    steps: ['1. Review violation details', '2. Take appropriate corrective action', '3. Re-run compliance scan'],
  };

  const embed = new EmbedBuilder()
    .setTitle(guide.title)
    .setColor('#4B5B8C')
    .addFields({ name: '📝 Steps to Resolve', value: guide.steps.join('\n'), inline: false })
    .setFooter({ text: 'RSA | Compliance Engine' })
    .setTimestamp();

  return embed;
}

module.exports = {
  buildComplianceSummaryEmbed,
  buildComplianceWarningEmbed,
  buildComplianceFeedEmbed,
  buildResolutionGuideEmbed,
};
