const DISCORD_API_BASE = 'https://discord.com/api/v10';
const guildId = process.env.DISCORD_GUILD_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

const STAFF_ROLE_NAMES = [
  'RSA | Founders',
  'RSA | Co Founders',
  'RSA | Executive',
  'RSA | Chairman',
  'RSA | Vice Chairman',
  'RSA | Board of Directors',
  'RSA | Director',
  'RSA | Head of Development',
  'RSA | Head Of Staff',
  'RSA | Developer',
  'RSA | Senior Staff',
  'RSA | Staff',
  'RSA | Media',
  'RSA | Panel',
  'RSA | Officials',
  'RSA | Managers',
  'RSA | Assistant Managers'
];

export async function fetchGuildRoles(): Promise<Record<string, string>> {
  if (!botToken || !guildId) {
    console.warn('[discord] DISCORD_BOT_TOKEN or DISCORD_GUILD_ID not set — skipping guild roles fetch');
    return {};
  }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${botToken}` }
  });

  if (!response.ok) {
    console.error('[discord] Unable to load Discord guild roles, status:', response.status);
    return {};
  }

  const roles = (await response.json()) as Array<{ id: string; name: string }>;
  return roles.reduce((map, role) => {
    map[role.id] = role.name;
    return map;
  }, {} as Record<string, string>);
}

export async function fetchGuildMember(discordId: string): Promise<Record<string, unknown> | null> {
  if (!botToken || !guildId) {
    console.warn('[discord] DISCORD_BOT_TOKEN or DISCORD_GUILD_ID not set — cannot verify guild membership');
    return null;
  }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${discordId}`, {
    headers: { Authorization: `Bot ${botToken}` }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error('[discord] Unable to verify Discord membership, status:', response.status);
    return null;
  }

  return response.json();
}

/**
 * Fetch every member of the guild via the Discord REST API (paginated).
 * Requires the bot to have the SERVER MEMBERS INTENT enabled in the Discord
 * Developer Portal. Returns null when Discord is not configured or the first
 * page request fails outright.
 */
export async function fetchAllGuildMembers(): Promise<any[] | null> {
  if (!botToken || !guildId) {
    console.warn('[discord] DISCORD_BOT_TOKEN or DISCORD_GUILD_ID not set — cannot fetch guild members');
    return null;
  }

  const all: any[] = [];
  let after = '0';

  // Discord returns up to 1000 members per page, ordered by ascending user id.
  for (let page = 0; page < 100; page++) {
    const url = `${DISCORD_API_BASE}/guilds/${guildId}/members?limit=1000&after=${after}`;
    const response = await fetch(url, { headers: { Authorization: `Bot ${botToken}` } });

    if (response.status === 429) {
      const retry = Number(response.headers.get('retry-after') ?? '1');
      await new Promise((r) => setTimeout(r, (retry + 0.5) * 1000));
      page--; // retry the same page
      continue;
    }

    if (!response.ok) {
      console.error('[discord] Unable to fetch guild members, status:', response.status);
      return all.length ? all : null;
    }

    const batch = (await response.json()) as any[];
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);
    after = batch[batch.length - 1]?.user?.id ?? after;
    if (batch.length < 1000) break;
  }

  return all;
}

export function mapDiscordRoles(roleIds: string[], roleMap: Record<string, string>) {
  return roleIds
    .map((roleId: string) => roleMap[roleId])
    .filter((name): name is string => typeof name === 'string' && STAFF_ROLE_NAMES.includes(name));
}

export function resolvePermission(roleNames: string[], botOwnerId?: string, userId?: string) {
  if (botOwnerId && userId === botOwnerId) {
    return 'owner';
  }

  const fullAdmin = ['RSA | Founders', 'RSA | Co Founders'];
  const leagueAdmin = ['RSA | Executive', 'RSA | Chairman', 'RSA | Vice Chairman', 'RSA | Board of Directors', 'RSA | Director', 'RSA | Head of Development', 'RSA | Head Of Staff', 'RSA | Developer'];
  const resultsAdmin = ['RSA | Officials', 'RSA | Panel'];
  const teamManagement = ['RSA | Managers', 'RSA | Assistant Managers'];

  if (roleNames.some((role) => fullAdmin.includes(role))) {
    return 'administrator';
  }

  if (roleNames.some((role) => leagueAdmin.includes(role))) {
    return 'league';
  }

  if (roleNames.some((role) => resultsAdmin.includes(role))) {
    return 'results';
  }

  if (roleNames.some((role) => teamManagement.includes(role))) {
    return 'manager';
  }

  return 'viewer';
}
