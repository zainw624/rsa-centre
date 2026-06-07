/**
 * RSA Operations Centre — Discord Bot Role Sync Helper
 * =====================================================
 * Drop this file into your Discord bot project and call pushRoleSync()
 * from your event handlers.
 *
 * Required environment variables on the BOT side:
 *   WEBSITE_URL        - Base URL of your RSA Ops site, e.g. https://rsa-ops.replit.app
 *   ROLES_SYNC_SECRET  - Shared secret (must match the value set on the website)
 *
 * The ROLES_SYNC_SECRET on the bot must EXACTLY match the one on the website.
 * Never expose it in client-visible code or logs.
 */

'use strict';

const ENDPOINT_PATH = '/api/roles-sync';
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Push a member's full role data to the RSA Ops website.
 *
 * @param {import('discord.js').GuildMember} member - The Discord.js GuildMember
 * @param {'member_update'|'member_join'|'member_leave'|'manual_sync'} [event]
 * @returns {Promise<{ ok: boolean, permission?: string, rolesStored?: number, teamsJoined?: string[] } | null>}
 */
async function pushRoleSync(member, event = 'member_update') {
  const websiteUrl   = process.env.WEBSITE_URL?.replace(/\/$/, '');
  const syncSecret   = process.env.ROLES_SYNC_SECRET;

  if (!websiteUrl || !syncSecret) {
    console.warn('[role-sync] WEBSITE_URL or ROLES_SYNC_SECRET not set — skipping sync');
    return null;
  }

  const discordId   = member.id;
  const username    = member.user?.username    ?? null;
  const displayName = member.displayName       ?? member.user?.globalName ?? username;
  const avatarHash  = member.user?.avatar      ?? null;
  const guildId     = member.guild?.id         ?? null;

  // Collect role IDs and names
  const roleIds   = member.roles.cache.map((role) => role.id);
  const roleNames = member.roles.cache.map((role) => role.name).filter((n) => n !== '@everyone');

  // Build avatar URL if the user has a custom avatar
  const avatar = avatarHash
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${(Number(BigInt(discordId) % 5n))}.png`;

  const payload = {
    discordId,
    username,
    displayName,
    avatar,
    roleIds,
    roleNames,
    guildId,
    event,
    timestamp: new Date().toISOString(),
  };

  const url = `${websiteUrl}${ENDPOINT_PATH}`;

  try {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-sync-secret':  syncSecret,
      },
      body:   JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn(`[role-sync] HTTP ${response.status} for ${discordId}: ${text.slice(0, 200)}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[role-sync] Request timed out for ${discordId}`);
    } else {
      console.warn(`[role-sync] Request failed for ${discordId}:`, err.message);
    }
    return null;
  }
}

/**
 * Push a "member left" event — deactivates roster and manager entries.
 *
 * @param {import('discord.js').GuildMember | import('discord.js').PartialGuildMember} member
 */
async function pushMemberLeave(member) {
  const websiteUrl = process.env.WEBSITE_URL?.replace(/\/$/, '');
  const syncSecret = process.env.ROLES_SYNC_SECRET;

  if (!websiteUrl || !syncSecret) return null;

  const payload = {
    discordId: member.id,
    guildId:   member.guild?.id ?? null,
    event:     'member_leave',
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${websiteUrl}${ENDPOINT_PATH}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-sync-secret': syncSecret,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

module.exports = { pushRoleSync, pushMemberLeave };
