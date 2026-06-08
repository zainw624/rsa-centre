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

export async function fetchGuildRoles() {
  if (!botToken || !guildId) {
    throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID');
  }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
    headers: {
      Authorization: `Bot ${botToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Unable to load Discord guild roles.');
  }

  const roles = (await response.json()) as Array<{ id: string; name: string }>;
  return roles.reduce((map, role) => {
    map[role.id] = role.name;
    return map;
  }, {} as Record<string, string>);
}

export async function fetchGuildMember(discordId: string) {
  if (!botToken || !guildId) {
    throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID');
  }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${discordId}`, {
    headers: {
      Authorization: `Bot ${botToken}`
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to verify Discord membership.');
  }

  return response.json();
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
