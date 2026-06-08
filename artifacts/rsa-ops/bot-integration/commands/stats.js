/**
 * RSA Bot — /stats slash command
 * =================================
 * Submit player stats for a match. Stats are ADDED to the season total
 * (e.g. run after every game: /stats player:@user goals:2 assists:1).
 *
 * Permissions: RSA Officials, managers, or bot owner.
 *
 * Required env vars on the BOT side:
 *   WEBSITE_URL        — Base URL of RSA Ops site (no trailing slash)
 *   ROLES_SYNC_SECRET  — Shared sync secret
 *
 * Examples:
 *   /stats player:@user goals:1 assists:0 clean_sheet:false motm:true
 *   /stats player:@user goals:0 assists:2 clean_sheet:true
 */

'use strict';

const { SlashCommandBuilder } = require('discord.js');

const ALLOWED_ROLE_NAMES = [
  'RSA | Founders', 'RSA | Co Founders', 'RSA | Executive',
  'RSA | Chairman', 'RSA | Vice Chairman',
  'RSA | Officials', 'RSA | Panel',
  'RSA | Managers', 'RSA | Assistant Managers',
];

const BOT_OWNER_ID = process.env.BOT_OWNER_ID;

function hasPermission(member) {
  if (member.id === BOT_OWNER_ID) return true;
  return member.roles.cache.some((r) => ALLOWED_ROLE_NAMES.includes(r.name));
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
    .setName('stats')
    .setDescription('Submit player stats for a match (adds to season total)')
    .addUserOption((o) =>
      o.setName('player').setDescription('Player to record stats for').setRequired(true),
    )
    .addIntegerOption((o) =>
      o.setName('goals').setDescription('Goals scored this match').setMinValue(0).setRequired(false),
    )
    .addIntegerOption((o) =>
      o.setName('assists').setDescription('Assists this match').setMinValue(0).setRequired(false),
    )
    .addBooleanOption((o) =>
      o.setName('clean_sheet').setDescription('Did the player keep a clean sheet?').setRequired(false),
    )
    .addBooleanOption((o) =>
      o.setName('motm').setDescription('Man of the Match award?').setRequired(false),
    )
    .addStringOption((o) =>
      o.setName('team').setDescription('Player\'s team name (optional, for linking stats)').setRequired(false),
    ),

  async execute(interaction) {
    if (!hasPermission(interaction.member)) {
      return interaction.reply({ content: '❌ You do not have permission to submit player stats.', flags: 64 });
    }

    const playerMember = interaction.options.getMember('player');
    const goals        = interaction.options.getInteger('goals')       ?? 0;
    const assists      = interaction.options.getInteger('assists')     ?? 0;
    const cleanSheet   = interaction.options.getBoolean('clean_sheet') ?? false;
    const motm         = interaction.options.getBoolean('motm')        ?? false;
    const teamName     = interaction.options.getString('team')         ?? null;

    if (!playerMember) {
      return interaction.reply({ content: '❌ Player not found in this server.', flags: 64 });
    }

    if (goals === 0 && assists === 0 && !cleanSheet && !motm) {
      return interaction.reply({
        content: '⚠️ No stats to record — at least one of goals, assists, clean_sheet, or motm must be set.',
        flags: 64,
      });
    }

    await interaction.deferReply({ ephemeral: false });

    const playerId  = playerMember.id;
    const playerTag = playerMember.displayName || playerMember.user.username;

    let response;
    try {
      response = await postToWebsite('/api/bot/stats', {
        playerId,
        playerTag,
        goals,
        assists,
        cleanSheet,
        motm,
        teamName,
        guildId: interaction.guildId,
      });
    } catch (err) {
      return interaction.editReply({ content: `❌ Failed to connect to the website: ${err.message}` });
    }

    if (!response.ok) {
      return interaction.editReply({
        content: `❌ Stats rejected: ${response.data?.error ?? 'Unknown error'}`,
      });
    }

    const { data } = response;

    const statLines = [
      goals       > 0 && `⚽ Goals: **+${goals}** → Season total: **${data.goals}**`,
      assists     > 0 && `🎯 Assists: **+${assists}** → Season total: **${data.assists}**`,
      cleanSheet       && `🧤 Clean Sheet: **+1** → Season total: **${data.cleanSheets}**`,
      motm             && `🏆 MOTM: **+1** → Season total: **${data.motm}**`,
    ].filter(Boolean).join('\n');

    return interaction.editReply({
      embeds: [{
        color: 0xC9A55A,
        title: '📊 Stats Recorded',
        description: `Stats for <@${playerId}> updated on the website.`,
        fields: [
          { name: 'This Match', value: statLines || 'No stats', inline: false },
        ],
        footer: { text: `Submitted by ${interaction.user.username} · RSA Operations Centre` },
        timestamp: new Date().toISOString(),
      }],
    });
  },
};
