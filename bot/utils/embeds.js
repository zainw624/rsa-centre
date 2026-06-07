const { EmbedBuilder } = require('discord.js');

function buildRosterEmbed(team) {
  const embed = new EmbedBuilder()
    .setTitle(`🏆 ${team.teamName} Roster`)
    .setColor('#1f1f1f')
    .setDescription(`Team Code: ${team.teamCode}`)
    .addFields(
      { name: '👤 Coach', value: team.coachDiscordId ? `<@${team.coachDiscordId}>` : 'No coach assigned', inline: false },
      { name: '📊 Squad Size', value: `${team.rosterPlayers.length}/${team.rosterLimit}`, inline: true }
    )
    .setFooter({ text: 'RSA | Roblox Soccer Association' })
    .setTimestamp();

  if (team.rosterPlayers.length > 0) {
    embed.addFields({ name: '📋 Players', value: team.rosterPlayers.map((player, index) => `${index + 1}. <@${player.playerId}> (${player.playerName})`).join('\n'), inline: false });
  } else {
    embed.addFields({ name: '📋 Players', value: 'No players in roster.', inline: false });
  }

  return embed;
}

function buildSigningEmbed(team, playerMention, transactionId) {
  return new EmbedBuilder()
    .setTitle('✅ Player Signed — Squad Added')
    .setDescription(`${team.teamCode}: RSA | ${team.teamName} have signed a new player.\n\n${playerMention} has joined the squad.`)
    .setColor('#00B37E')
    .addFields(
      { name: '📌 Player', value: `${playerMention}`, inline: false },
      { name: '🏆 Team', value: team.roleId ? `<@&${team.roleId}>` : team.teamName, inline: true },
      { name: '👤 Coach', value: team.coachDiscordId ? `<@${team.coachDiscordId}>` : 'No coach assigned', inline: true },
      { name: '🟩 Roster', value: `${team.rosterPlayers.length}/${team.rosterLimit}`, inline: true }
    )
    .setFooter({ text: `[RSA] #${transactionId}` })
    .setTimestamp();
}

function buildReleaseEmbed(team, playerMention, transactionId, reason) {
  return new EmbedBuilder()
    .setTitle('📋 Player Released — Squad Removed')
    .setDescription(`${team.teamCode}: RSA | ${team.teamName} have released a player.`)
    .setColor('#F04747')
    .addFields(
      { name: '📌 Player', value: `${playerMention}`, inline: false },
      { name: '🏆 Former Team', value: team.roleId ? `<@&${team.roleId}>` : team.teamName, inline: true },
      { name: '👤 Coach', value: team.coachDiscordId ? `<@${team.coachDiscordId}>` : 'No coach assigned', inline: true },
      { name: '🟥 Roster', value: `${team.rosterPlayers.length}/${team.rosterLimit}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided', inline: false }
    )
    .setFooter({ text: `[RSA] #${transactionId}` })
    .setTimestamp();
}

function buildSanctionEmbed(playerMention, transactionId, sanctionType, reason) {
  return new EmbedBuilder()
    .setTitle(`⚠️ Player Sanctioned — ${sanctionType}`)
    .setDescription(`${playerMention} has received a ${sanctionType} sanction.`)
    .setColor('#E0A106')
    .addFields(
      { name: '📌 Player', value: `${playerMention}`, inline: false },
      { name: '🛡️ Sanction', value: sanctionType, inline: true },
      { name: 'Reason', value: reason || 'No reason provided', inline: false }
    )
    .setFooter({ text: `[RSA] #${transactionId}` })
    .setTimestamp();
}

function buildIllegalSigningEmbed(playerMention, teamName, issue, transactionId) {
  return new EmbedBuilder()
    .setTitle('🚨 Illegal Signing Detected')
    .setDescription(`${playerMention} received a national team role without a valid transaction or roster entry.`)
    .setColor('#ED4245')
    .addFields(
      { name: '📌 Player', value: `${playerMention}`, inline: false },
      { name: '🏆 Team', value: teamName, inline: true },
      { name: 'Issue', value: issue, inline: false },
      { name: 'Transaction', value: transactionId || 'None', inline: true }
    )
    .setFooter({ text: `[RSA] #${transactionId || 'N/A'}` })
    .setTimestamp();
}

function buildHealthcheckEmbed(status) {
  const embed = new EmbedBuilder()
    .setTitle('✅ RSA Healthcheck')
    .setColor('#00B37E')
    .setTimestamp();

  Object.entries(status).forEach(([key, value]) => {
    embed.addFields({ name: key, value: value ? '✅ OK' : '❌ Failed', inline: true });
  });

  return embed;
}

function buildResultAddEmbed(result, addedByMention) {
  const winner = result.homeScore > result.awayScore ? result.homeTeam : result.awayScore > result.homeScore ? result.awayTeam : 'Draw';
  const resultColor = winner === 'Draw' ? '#4B5B8C' : '#00B37E';

  return new EmbedBuilder()
    .setTitle('⚽ Match Result Added')
    .setDescription(`${result.homeTeam} **${result.homeScore}** - **${result.awayScore}** ${result.awayTeam}`)
    .setColor(resultColor)
    .addFields(
      { name: '🏟️ Stadium', value: result.stadium, inline: true },
      { name: '🎯 Competition', value: result.competition, inline: true },
      { name: '👥 Attendance', value: result.attendance > 0 ? result.attendance.toLocaleString() : 'Not recorded', inline: true },
      { name: '📅 Date', value: new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), inline: true },
      { name: '📝 Notes', value: result.notes || 'None', inline: false },
      { name: '➕ Added By', value: addedByMention, inline: true }
    )
    .setFooter({ text: `Result ID: ${result.id}` })
    .setTimestamp();
}

function buildResultEditEmbed(result, editedByMention) {
  const winner = result.homeScore > result.awayScore ? result.homeTeam : result.awayScore > result.homeScore ? result.awayTeam : 'Draw';
  const resultColor = winner === 'Draw' ? '#4B5B8C' : '#00B37E';

  return new EmbedBuilder()
    .setTitle('✏️ Match Result Updated')
    .setDescription(`${result.homeTeam} **${result.homeScore}** - **${result.awayScore}** ${result.awayTeam}`)
    .setColor(resultColor)
    .addFields(
      { name: '🏟️ Stadium', value: result.stadium, inline: true },
      { name: '🎯 Competition', value: result.competition, inline: true },
      { name: '👥 Attendance', value: result.attendance > 0 ? result.attendance.toLocaleString() : 'Not recorded', inline: true },
      { name: '📅 Date', value: new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), inline: true },
      { name: '✏️ Edited By', value: editedByMention, inline: true }
    )
    .setFooter({ text: `Result ID: ${result.id}` })
    .setTimestamp();
}

function buildResultDeleteEmbed(result, deletedByMention) {
  return new EmbedBuilder()
    .setTitle('🗑️ Match Result Removed')
    .setDescription(`${result.homeTeam} **${result.homeScore}** - **${result.awayScore}** ${result.awayTeam}`)
    .setColor('#F04747')
    .addFields(
      { name: '🏟️ Stadium', value: result.stadium, inline: true },
      { name: '🎯 Competition', value: result.competition, inline: true },
      { name: '📅 Date', value: new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), inline: true },
      { name: '🗑️ Removed By', value: deletedByMention, inline: true }
    )
    .setFooter({ text: `Result ID: ${result.id}` })
    .setTimestamp();
}

function buildResultsListEmbed(results, title = '📊 Recent Results', limit = 10) {
  const recentResults = results.slice(0, limit);

  if (recentResults.length === 0) {
    return new EmbedBuilder()
      .setTitle(title)
      .setDescription('No results found.')
      .setColor('#4B5B8C')
      .setFooter({ text: 'RSA | Roblox Soccer Association' })
      .setTimestamp();
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor('#1f1f1f')
    .setFooter({ text: 'RSA | Roblox Soccer Association' })
    .setTimestamp();

  const resultsList = recentResults
    .map((result) => {
      const winner = result.homeScore > result.awayScore ? '🟩' : result.awayScore > result.homeScore ? '🟥' : '🟦';
      const date = new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${winner} ${result.homeTeam} **${result.homeScore}** - **${result.awayScore}** ${result.awayTeam} *(${date})*`;
    })
    .join('\n');

  embed.addFields({ name: '⚽ Results', value: resultsList, inline: false });

  return embed;
}

function buildTeamResultsEmbed(results, teamName) {
  const teamResults = results.filter((r) => r.homeTeam === teamName || r.awayTeam === teamName).slice(0, 10);

  if (teamResults.length === 0) {
    return new EmbedBuilder()
      .setTitle(`📊 ${teamName} Results`)
      .setDescription('No results found for this team.')
      .setColor('#4B5B8C')
      .setFooter({ text: 'RSA | Roblox Soccer Association' })
      .setTimestamp();
  }

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  const resultsList = teamResults
    .map((result) => {
      const isHome = result.homeTeam === teamName;
      const score = isHome ? result.homeScore : result.awayScore;
      const opponentScore = isHome ? result.awayScore : result.homeScore;
      const opponent = isHome ? result.awayTeam : result.homeTeam;

      if (score > opponentScore) {
        wins++;
      } else if (score < opponentScore) {
        losses++;
      } else {
        draws++;
      }

      goalsFor += score;
      goalsAgainst += opponentScore;

      const result_symbol = score > opponentScore ? '🟩' : score < opponentScore ? '🟥' : '🟦';
      const date = new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${result_symbol} vs ${opponent} **${score}** - **${opponentScore}** *(${date})*`;
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`📊 ${teamName} Results`)
    .setColor('#1f1f1f')
    .addFields(
      { name: '⚽ Record', value: `Wins: ${wins} | Draws: ${draws} | Losses: ${losses}`, inline: false },
      { name: '🎯 Goal Differential', value: `Scored: ${goalsFor} | Conceded: ${goalsAgainst}`, inline: true },
      { name: '📈 Win Rate', value: `${((wins / teamResults.length) * 100).toFixed(1)}%`, inline: true }
    )
    .addFields({ name: '📋 Recent Matches', value: resultsList, inline: false })
    .setFooter({ text: 'RSA | Roblox Soccer Association' })
    .setTimestamp();

  return embed;
}

module.exports = {
  buildRosterEmbed,
  buildSigningEmbed,
  buildReleaseEmbed,
  buildSanctionEmbed,
  buildIllegalSigningEmbed,
  buildHealthcheckEmbed,
  buildResultAddEmbed,
  buildResultEditEmbed,
  buildResultDeleteEmbed,
  buildResultsListEmbed,
  buildTeamResultsEmbed,
};
