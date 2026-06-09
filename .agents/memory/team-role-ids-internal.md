---
name: Team role IDs are internal-only
description: Discord role IDs must never reach the browser; where to strip them.
---

# Discord role IDs must never reach the browser

Team Discord role IDs (`Team.roleId`) and `Team.coachDiscordId` are internal-only. Leaking them lets outsiders enumerate/guess server role structure.

**Strip at the db-function source, not just the API route.** `getAllTeams()` and `getTeamByCodeOrName()` in `lib/db.ts` now map out `roleId`/`coachDiscordId` before returning.

**Why this matters (non-obvious Next.js trap):** the `/api/teams` JSON route was sanitized, but the Teams/Rosters **server components** call `getAllTeams()` and pass the rows as props into client components (`<TeamsClient initial={teams} />`). Next.js serializes client-component props into the browser payload, so sanitizing only the REST route still leaked the IDs. Sanitizing in the shared db function closes every consumer at once.

**How to apply:** any new query that returns `Team` rows to a page/component or API must drop `roleId` and `coachDiscordId` unless the value stays strictly server-side (e.g. the sync logic, which reads `prisma.team.findMany()` directly — that's fine, it never crosses to the client).
