---
name: Team payload sanitization
description: Which identifiers must be stripped from team objects before they reach the browser, and which are intentionally kept.
---

# Team payload sanitization (rsa-ops)

All team objects sent to the browser (server-component props AND `/api/teams` JSON)
go through `sanitizeTeam()` in `artifacts/rsa-ops/lib/db.ts`. Any new query that
returns team data to a client must run through it.

**Stripped (sensitive / not needed client-side):**
- `roleId`, `coachDiscordId` — Discord role IDs.
- `teamId` — the `@unique` business identifier (potentially externally meaningful); not used client-side (routing/keys use `teamCode`/cuid `id`).
- roster player `playerId` (Discord user ID) and `userId`.
- nested manager `user` is reduced to `{ id, name, image }` — drops `discordId`, `roles`, `email`.

**Kept on purpose:**
- the random cuid `id` (team, roster entry, assignment) — used only as React keys / selector state, never rendered to users. cuids are designed to be exposed.
- `teamCode`, `teamName`, `group`, `logo`, counts, role labels.

**Why:** Prompt policy is "never *display* Discord IDs / role IDs / internal identifiers." The real sensitive values are Discord snowflakes; cuids are non-sensitive and necessary for keys.

**How to apply:** when adding a team query consumed by a client component or API route, return `sanitizeTeam(...)`; never hand a raw Prisma team (with nested `user`) to the client. For the public team URL slug use `teamCode` (route is `/teams/[team]` keyed on teamCode/teamName).

# League-table record selection
`getTeamByCodeOrName` orders `leagueTableEntries` by `updatedAt: 'desc'` and the team
page uses `[0]` (most recent season) for the record/stats, falling back to a record
computed from `results` when no league-table entry exists. Do not use an unordered
`[0]` — multiple season entries would otherwise show stale stats.
