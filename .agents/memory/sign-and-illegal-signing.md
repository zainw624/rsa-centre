---
name: /sign permissions & illegal-signing policy
description: Who can run the bot /sign command and when a team-role assignment is flagged as illegal
---

# /sign access & illegal-signing flagging (Discord bot)

## /sign execution gate
`/sign` stays globally visible — it is registered for everyone (no owner/admin
filter in `bot/main.js` buildCommands, and `sign.js` sets no
`setDefaultMemberPermissions`). Authorization is enforced at execute time only:
the member must (a) hold a Manager/Assistant-Manager role AND (b) hold a national
team role (`getTeamForMember`).

**Why:** request was "visible to everyone, executable only by Managers or
Assistant Managers with a valid team role." Note `settings.managerRoleNames`
already equals `MANAGER_ROLES` = both `RSA | Managers` and
`RSA | Assistant Managers` (see `bot/utils/hierarchy.js`), so the role-name check
covers both — the team-role requirement is the added piece.

**How to apply:** never gate command *registration* by owner/admin to restrict
who can run a command; gate inside `execute()`.

## Illegal-signing flagging
`bot/events/guildMemberUpdate.js` must NOT flag a manually-assigned national team
role as an illegal signing on its own. It only flags when there is a clear
eligibility breach: the player also holds `settings.cupTiedRoleId` or
`settings.sanctionedRoleId`. The old transaction/roster/transfer-window heuristic
was removed because it false-positived on every manual roling.

**Why:** staff routinely assign team roles by hand; treating that as "illegal"
spammed the contracts channel. Real breaches = cup-tied or sanctioned players.

## Portugal
Portugal is already canonical in code: `bot/data/teams.json` and website
`artifacts/rsa-ops/lib/teamRoles.ts` both have it with the SAME roleId
`1512180497701273641` (Group C), plus all duplicated lists. If Portugal "isn't on
the bot," it is a deploy/runtime-state issue (Render bot needs redeploy), not a
missing code path.
