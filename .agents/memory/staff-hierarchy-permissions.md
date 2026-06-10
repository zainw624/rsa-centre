---
name: Staff hierarchy & permission model
description: Where the RSA staff role hierarchy lives and the rules around editing it
---

# Staff hierarchy & permissions

`artifacts/rsa-ops/lib/permissions.ts` is the SINGLE source of truth for the staff
role hierarchy, seniority ranking, tier mapping, departments, and the capability
model. The staff directory, the admin-panel gate, the session permission tier
(via lib/auth.ts → lib/discord.ts), TopNav role display, and Discord sync all read
from it. Change roles here and the rest of the app follows.

- Role strings MUST match the Discord role names **exactly, including casing and
  spacing** (e.g. `RSA | Head of Development`, `RSA | Staff advisor`). Mapping is by
  exact string; a casing mismatch silently drops a member to `viewer`.
- Permission tiers: leadership roles (CEO → Head Director) = `administrator`;
  Executive → Staff = `league`; Officials = `results`; Managers = non-admin
  `manager`; everyone else = `viewer`.
- The capability model (`CAPABILITIES`/`can()`) defines what each tier may do. There
  is deliberately NO capability for editing site source, branding/themes, env
  vars/secrets, bot token, deployment, or DB credentials — **no role, not even
  owner, can do those through the website.** Keep that boundary when editing tiers.

**Why:** the Discord hierarchy changes periodically; without a single source of truth
the tiers drift and the "things no role can do" guarantee gets eroded.

**How to apply:** when Discord roles change, update HIERARCHY + permissionForRoles
cutoffs + ROLE_DEPARTMENT/DEPARTMENT_ORDER together in permissions.ts ONLY. The admin
panel renders the result via rolesByTier/capabilitiesForTier/RESTRICTED_ACTIONS.

## Bot side (Discord bot mirrors the website)

The Discord bot has its OWN copy of the hierarchy at `bot/utils/hierarchy.js`
(HIERARCHY, ADMIN_ROLES, LEAGUE_ROLES, OFFICIALS_ROLES, LEAGUE_AND_ADMIN, ALL_STAFF,
MANAGER_ROLES, DEPARTMENT_MAP/ORDER, BOT_OWNER_ROLE). It must be kept in lockstep with
`artifacts/rsa-ops/lib/permissions.ts`. The bot matches roles by EXACT `role.name`
(`memberHasRoleNames`), so casing/spacing drift silently drops members.

- **Gotcha:** `bot/data/settings.json` OVERRIDES `DEFAULT_SETTINGS` (loadSettings does
  `{...DEFAULT_SETTINGS, ...loaded}`). Any role-list change in `utils/settings.js` MUST
  also be made in `data/settings.json` or the stale persisted values win.
- Settings-driven permission lists (read from `settings.*RoleNames`): sanction, audit,
  worldCupLock/Unlock, staffCentre — used by sanction/auditrosters/transactionaudit/
  worldcuplock/worldcupunlock/restoresnapshot/release commands.
- Hardcoded permission arrays live in commands `announcefix.js`, `results.js`,
  `compliance.js`, `dashboard.js` — these import tiers from `utils/hierarchy.js` directly.
- `managerRoleNames` vs `assistantManagerRoleNames` are deliberately SEPARATE keys
  (configLoader validates both; leadership.js reads each `[0]` separately;
  scout/sign/release gate on managerRoleNames only). Do not merge them.
- **Deliberate divergence:** worldCupUnlock is destructive, kept to ADMIN_ROLES
  (leadership) only, narrower than the website's league-tier manageCompetitions.

**Why:** bot deploys on Render from GitHub (separate from the Replit-published website),
so the two hierarchies can drift independently if not updated together.
