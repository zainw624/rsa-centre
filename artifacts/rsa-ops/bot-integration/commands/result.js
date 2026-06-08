/**
 * RSA Bot — /result slash command
 * ==================================
 * Submit a match result. Automatically updates both teams' group standings
 * on the website (points, GF, GA, GD, W/D/L).
 *
 * Permissions: RSA Officials, league staff, or bot owner.
 *
 * Required env vars on the BOT side:
 *   WEBSITE_URL        — Base URL of RSA Ops site (no trailing slash)
 *   ROLES_SYNC_SECRET  — Shared sync secret
 *
 * Channel IDs:
 *   Bot commands: 1512871626637578371
 */

'use strict';

const { SlashCommandBuilder } = require('discord.js');

const OFFICIAL_ROLE_NAMES = [
  'RSA | Founders', 'RSA | Co Founders', 'RSA | Executive',
  'RSA | Chairman', 'RSA | Vice Chairman',
  'RSA | Officials', 'RSA | Panel',
  'RSA | Managers',
];

const BOT_OWNER_ID = process.env.BOT_OWNER_ID;

function hasPermission(member) {
  if (member.id === BOT_OWNER_ID) return true;
  return member.roles.cache.some((r) => OFFICIAL_ROLE_NAMES.includes(r.name));
}

async function postToWebsite(path, body) {
  const websiteUrl  = process.env.WEBSITE_URL?.replace(/\/$/, '');
  const syncSecret  = process.env.ROLES_SYNC_SECRET;
  if (!websiteUrl || !syncSecret) throw new Error('WEBSITE_URL or ROLES_SYNC_SECRET not set');

  const res = await fetch(`${websiteUrl}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'x-sync-secret': syncSecret,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('result')
    .setDescription('Submit a match result and update group standings')
    .addStringOption((o) =>
      o.setName('home').setDescription('Home team name (e.g. England)').setRequired(true),
    )
    .addStringOption((o) =>
      o.setName('away').setDescription('Away team name (e.g. France)').setRequired(true),
    )
    .addIntegerOption((o) =>
      o.setName('home_score').setDescription('Goals scored by home team').setRequired(true).setMinValue(0),
    )
    .addIntegerOption((o) =>
      o.setName('away_score').setDescription('Goals scored by away team').setRequired(true).setMinValue(0),
    )
    .addStringOption((o) =>
      o.setName('competition').setDescription('Competition name (optional)').setRequired(false),
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member)) {
      return interaction.reply({ content: '❌ You do not have permission to submit results.', flags: 64 });
    }

    const homeTeam   = interaction.options.getString('home');
    const awayTeam   = interaction.options.getString('away');
    const homeScore  = interaction.options.getInteger('home_score');
    const awayScore  = interaction.options.getInteger('away_score');
    const competition = interaction.options.getString('competition') ?? 'RSA Season 2026';

    await interaction.deferReply({ ephemeral: false });

    let response;
    try {
      response = await postToWebsite('/api/bot/result', {
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        competition,
        submittedById: interaction.user.id,
        guildId: interaction.guildId,
      });
    } catch (err) {
      return interaction.editReply({ content: `❌ Failed to connect to the website: ${err.message}` });
    }

    if (!response.ok) {
      return interaction.editReply({
        content: `❌ Result rejected: ${response.data?.error ?? 'Unknown error'}`,
      });
    }

    const { data } = response;
    const outcomeEmoji = homeScore > awayScore ? '🏆' : awayScore > homeScore ? '🏆' : '🤝';
    const winner = homeScore > awayScore ? data.homeTeam : awayScore > homeScore ? data.awayTeam : null;

    return interaction.editReply({
      embeds: [{
        color: 0xC9A55A,
        title: `${outcomeEmoji} Result Recorded`,
        fields: [
          {
            name: `${data.homeTeam ?? homeTeam}  ${homeScore} – ${awayScore}  ${data.awayTeam ?? awayTeam}`,
            value: winner ? `**${winner}** win · ${competition}` : `Draw · ${competition}`,
            inline: false,
          },
          {
            name: 'Standings',
            value: [
              data.homeEntry ? `✅ ${data.homeTeam ?? homeTeam} standings updated` : `⚠️ ${homeTeam} not found in standings`,
              data.awayEntry ? `✅ ${data.awayTeam ?? awayTeam} standings updated` : `⚠️ ${awayTeam} not found in standings`,
            ].join('\n'),
            inline: false,
          },
        ],
        footer: { text: `Submitted by ${interaction.user.username} · RSA Operations Centre` },
        timestamp: new Date().toISOString(),
      }],
    });
  },
};
