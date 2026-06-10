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
