---
name: Standings auto-heal on result
description: Why updateStandingsFromResult creates LeagueTable rows on the fly
---

# Standings auto-heal

`updateStandingsFromResult` (lib/db.ts) increments a team's `LeagueTable` row. If the
row doesn't exist yet it is **created on the fly** using the team's `group` + the
current season, so a recorded result always moves the table. It returns
`standingsUpdated` (true only when both teams' rows were updated/created).

Creation only happens when a current season exists AND the team has a `group`. If
either is missing the result is still saved but the table doesn't move, and
`standingsUpdated` is false — the bot surfaces an actionable warning.

**Why:** without this, a result on an unseeded table silently no-ops while returning
HTTP 200, giving operators false success (flagged in code review).

**How to apply:** group membership lives in `lib/teamRoles.ts` (`TEAMS`); a team with
no group won't auto-create a standings row. Seeding the full grid is still an admin
action via `/api/admin/seed-groups` (requires `manageCompetitions`).
