/**
 * Canonical RSA staff hierarchy for the Discord bot.
 *
 * This MUST stay in sync with the website's source of truth at
 * artifacts/rsa-ops/lib/permissions.ts. Role strings must match the Discord
 * role names EXACTLY (including casing and spacing) — membership is matched by
 * exact name, so a mismatch silently drops a member to no access.
 *
 * Tier model (mirrors the website):
 *   - ADMIN_ROLES   → website "administrator" (leadership / full admins)
 *   - LEAGUE_ROLES  → website "league" (league staff)
 *   - OFFICIALS      → website "results"
 *   - MANAGER_ROLES → website "manager" (team managers, NON-admin)
 */

/** Full hierarchy, most senior first. */
const HIERARCHY = [
  'CEO',
  'RSA | Founder',
  'RSA | Co Founder',
  'RSA | Owner',
  'RSA | Head Director',
  'Leadership',
  'RSA | Executive',
  'RSA | Head Management',
  'RSA | Management',
  'RSA | Head of Developement',
  'RSA | Staff Overseer',
  'RSA | Developer',
  'RSA | Bot Manager',
  'RSA | Staff advisor',
  'RSA | Staff',
  'RSA | Officials',
];

/** Leadership — full administrators on the website. */
const ADMIN_ROLES = [
  'CEO',
  'RSA | Founder',
  'RSA | Co Founder',
  'RSA | Owner',
  'RSA | Head Director',
];

/** League staff (Leadership … Staff). */
const LEAGUE_ROLES = [
  'Leadership',
  'RSA | Executive',
  'RSA | Head Management',
  'RSA | Management',
  'RSA | Head of Developement',
  'RSA | Staff Overseer',
  'RSA | Developer',
  'RSA | Bot Manager',
  'RSA | Staff advisor',
  'RSA | Staff',
];

/** Match officials only. */
const OFFICIALS_ROLES = ['RSA | Officials'];

/** Leadership + league staff (everyone except officials, managers, members). */
const LEAGUE_AND_ADMIN = [...ADMIN_ROLES, ...LEAGUE_ROLES];

/** Every staff role, including officials (mirrors website "results" tier). */
const ALL_STAFF = [...LEAGUE_AND_ADMIN, ...OFFICIALS_ROLES];

/** Team manager roles — NON-admin, never grant administrative capability. */
const MANAGER_ROLES = ['RSA | Managers', 'RSA | Assistant Managers'];

/** The literal owner override role. */
const BOT_OWNER_ROLE = 'Bot Owner';

/** Department grouping for the staff centre, keyed by role name. */
const DEPARTMENT_MAP = {
  'CEO': 'Leadership',
  'RSA | Founder': 'Leadership',
  'RSA | Co Founder': 'Leadership',
  'RSA | Owner': 'Leadership',
  'RSA | Head Director': 'Leadership',
  'Leadership': 'Leadership',
  'RSA | Executive': 'Executive Board',
  'RSA | Head Management': 'Executive Board',
  'RSA | Management': 'Executive Board',
  'RSA | Head of Developement': 'Development',
  'RSA | Staff Overseer': 'Development',
  'RSA | Developer': 'Development',
  'RSA | Bot Manager': 'Development',
  'RSA | Staff advisor': 'Staff',
  'RSA | Staff': 'Staff',
  'RSA | Officials': 'League Operations',
};

/** Order departments are displayed in (most senior first). */
const DEPARTMENT_ORDER = [
  'Leadership',
  'Executive Board',
  'Development',
  'Staff',
  'League Operations',
];

module.exports = {
  HIERARCHY,
  ADMIN_ROLES,
  LEAGUE_ROLES,
  OFFICIALS_ROLES,
  LEAGUE_AND_ADMIN,
  ALL_STAFF,
  MANAGER_ROLES,
  BOT_OWNER_ROLE,
  DEPARTMENT_MAP,
  DEPARTMENT_ORDER,
};
