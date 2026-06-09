---
name: RSA permissions & website-security model
description: Single source of truth for the role hierarchy, capability gating, and ID-hiding rules
---

# lib/permissions.ts is the ONE source of truth (client-safe, no server deps)

All role/permission decisions go through `artifacts/rsa-ops/lib/permissions.ts`.
`lib/discord.ts` (mapDiscordRoles, resolvePermission) and `lib/discordSync.ts`
delegate to it; UI and route handlers call `can(permission, capability)`.

**Rules baked in (from product spec — keep consistent):**
- Always ignore Discord roles `*` and `kov` (`IGNORED_ROLES` / `isIgnoredRole`).
- Always display the single HIGHEST role only (`getHighestRole`), never raw role lists.
- 11-role `HIERARCHY` (Commissioners … Officials). Manager roles are non-admin.
- Tier mapping (`permissionForRoles`): administrator = Commissioners/Vice Commissioners;
  league = Executive…Staff; results = Officials; manager = manager roles; viewer = rest.
- Capability matrix (`can`): submitResults/recalcStandings = Officials+; manageFixtures/
  Transfers/Discipline/Competitions/syncDiscord/viewAdmin = league+; managePermissions/
  manageStaffHierarchy/manageSettings/backup = admin only.

**Hard security boundary:** there is intentionally NO capability for editing website
source/branding/themes, viewing env/secrets/tokens, deployment, or DB creds. No role can
do those — never add such a capability.

**ID hiding:** never render Discord IDs / role IDs / playerId in the UI. Display only
Username/Display Name/Team/Role. Do NOT use `name ?? discordId` fallbacks — fall back to
'—' or 'Unknown' instead. Applies to cards, profile pages, team pages, and search results.

**Why:** this is a private league ops tool; leaking IDs or granting infra-level access to
Discord-role-based users is the core risk PROMPT 3 closed.
