/**
 * Canonical RSA staff hierarchy + permission model.
 *
 * Single source of truth for: role ranking, "highest role" display, which roles
 * are tracked at all, and what each permission tier is allowed to do.
 *
 * This module is intentionally free of server-only imports (no prisma, no env)
 * so it can be imported from both server code and client components.
 */

/** Roles that must NEVER be used for hierarchy or permissions. */
export const IGNORED_ROLES = ['*', 'kov'];

/**
 * Official RSA hierarchy, highest authority first. The order here defines
 * seniority — index 0 is the most senior.
 */
export const HIERARCHY = [
  'RSA | Commissioners',
  'RSA | Vice Commissioners',
  'RSA | Executive',
  'RSA | Chairman',
  'RSA | Vice Chairman',
  'RSA | Head Of Development',
  'RSA | Head Of Staff',
  'RSA | Developer',
  'RSA | Senior Staff',
  'RSA | Staff',
  'RSA | Officials',
] as const;

export type HierarchyRole = (typeof HIERARCHY)[number];

/**
 * Manager roles are tracked so the Managers directory works, but they are
 * NON-admin: they never grant any administrative capability.
 */
export const MANAGER_ROLES = ['RSA | Managers', 'RSA | Assistant Managers'];

/**
 * Every role the app persists and reasons about. Team roles, player roles,
 * "Free Agent", "Verified", "*" and "kov" are intentionally excluded.
 */
export const TRACKED_ROLES: string[] = [...HIERARCHY, ...MANAGER_ROLES];

/** True when a role must be ignored entirely (`*`, `kov`). */
export function isIgnoredRole(role: string): boolean {
  if (!role) return true;
  const trimmed = role.trim().toLowerCase();
  return IGNORED_ROLES.some((r) => r.toLowerCase() === trimmed);
}

/**
 * Seniority rank for a role. Higher = more senior. Commissioners = 11,
 * Officials = 1, anything outside the hierarchy = 0.
 */
export function roleRank(role: string): number {
  const idx = (HIERARCHY as readonly string[]).indexOf(role);
  return idx === -1 ? 0 : HIERARCHY.length - idx;
}

/**
 * The single highest hierarchy role a member holds (ignoring `*`/`kov` and any
 * non-hierarchy role), or null. This is what should always be displayed —
 * e.g. Commissioner + Officials → "RSA | Commissioners".
 */
export function getHighestRole(roleNames: string[] = []): string | null {
  let best: string | null = null;
  let bestRank = 0;
  for (const r of roleNames) {
    if (!r || isIgnoredRole(r)) continue;
    const rank = roleRank(r);
    if (rank > bestRank) {
      bestRank = rank;
      best = r;
    }
  }
  return best;
}

/** A role label without the "RSA | " prefix, for compact display. */
export function shortRole(role: string | null | undefined): string {
  if (!role) return 'Member';
  return role.replace(/^RSA \| /, '');
}

/* ------------------------------------------------------------------ */
/* Permission tiers                                                    */
/* ------------------------------------------------------------------ */

export type Permission =
  | 'owner'
  | 'administrator'
  | 'league'
  | 'results'
  | 'manager'
  | 'viewer';

/**
 * Map a member's Discord roles to a coarse permission tier.
 *
 * - administrator: Commissioners, Vice Commissioners (league administrators)
 * - league:        Executive … Staff (league staff)
 * - results:       Officials
 * - manager:       RSA | Managers / Assistant Managers (NON-admin)
 * - viewer:        everyone else (Free Agent, Verified, team/player roles)
 *
 * `*` and `kov` are ignored. Non-admin roles can never escalate to admin.
 */
export function permissionForRoles(roleNames: string[] = [], isOwner = false): Permission {
  if (isOwner) return 'owner';

  const top = getHighestRole(roleNames);
  if (top) {
    const rank = roleRank(top);
    if (rank >= roleRank('RSA | Vice Commissioners')) return 'administrator';
    if (rank >= roleRank('RSA | Staff')) return 'league';
    if (top === 'RSA | Officials') return 'results';
  }

  if (roleNames.some((r) => MANAGER_ROLES.includes(r))) return 'manager';
  return 'viewer';
}

/* ------------------------------------------------------------------ */
/* Capabilities                                                        */
/*                                                                    */
/* There is deliberately NO capability for editing website source,    */
/* branding, themes, or for viewing env vars / secrets / bot tokens / */
/* deployment settings / database credentials. No role can do those.  */
/* ------------------------------------------------------------------ */

export type Capability =
  // Officials and above
  | 'submitResults'        // submit results, update completed fixtures
  | 'recalcStandings'      // trigger standings recalculation
  // League staff and above
  | 'manageFixtures'       // schedule / create fixtures
  | 'manageTransfers'
  | 'manageDiscipline'
  | 'manageCompetitions'   // world cup, league configuration
  | 'syncDiscord'
  | 'viewAdmin'            // open the administration panel
  // League administrators only
  | 'managePermissions'
  | 'manageStaffHierarchy'
  | 'manageSettings'
  | 'backup';

const RESULTS_TIERS = new Set<Permission>(['owner', 'administrator', 'league', 'results']);
const LEAGUE_TIERS = new Set<Permission>(['owner', 'administrator', 'league']);
const ADMIN_TIERS = new Set<Permission>(['owner', 'administrator']);

const CAPABILITIES: Record<Capability, Set<Permission>> = {
  submitResults: RESULTS_TIERS,
  recalcStandings: RESULTS_TIERS,
  manageFixtures: LEAGUE_TIERS,
  manageTransfers: LEAGUE_TIERS,
  manageDiscipline: LEAGUE_TIERS,
  manageCompetitions: LEAGUE_TIERS,
  syncDiscord: LEAGUE_TIERS,
  viewAdmin: LEAGUE_TIERS,
  managePermissions: ADMIN_TIERS,
  manageStaffHierarchy: ADMIN_TIERS,
  manageSettings: ADMIN_TIERS,
  backup: ADMIN_TIERS,
};

/** Whether a permission tier is allowed to perform a capability. */
export function can(permission: string | null | undefined, capability: Capability): boolean {
  if (!permission) return false;
  return CAPABILITIES[capability]?.has(permission as Permission) ?? false;
}

/** Human-readable label for a permission tier. */
export const PERMISSION_LABEL: Record<Permission, string> = {
  owner: 'Owner',
  administrator: 'League Admin',
  league: 'League Staff',
  results: 'Official',
  manager: 'Manager',
  viewer: 'Member',
};

/** Accent colour for a permission tier badge. */
export const PERMISSION_COLOR: Record<Permission, string> = {
  owner: '#f59e0b',
  administrator: '#c9a55a',
  league: '#60a5fa',
  results: '#34d399',
  manager: '#a78bfa',
  viewer: '#64748b',
};

/** Department grouping for the staff directory, keyed by highest role. */
export const ROLE_DEPARTMENT: Record<string, string> = {
  'RSA | Commissioners': 'Commission',
  'RSA | Vice Commissioners': 'Commission',
  'RSA | Executive': 'Executive Board',
  'RSA | Chairman': 'Executive Board',
  'RSA | Vice Chairman': 'Executive Board',
  'RSA | Head Of Development': 'Operations',
  'RSA | Head Of Staff': 'Operations',
  'RSA | Developer': 'Operations',
  'RSA | Senior Staff': 'Staff',
  'RSA | Staff': 'Staff',
  'RSA | Officials': 'League Operations',
};

/** Order departments are displayed in (most senior first). */
export const DEPARTMENT_ORDER = [
  'Commission',
  'Executive Board',
  'Operations',
  'Staff',
  'League Operations',
];
