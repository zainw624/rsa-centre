---
name: Morocco/Sweden team swap
description: Which of Morocco vs Sweden is the canonical 16th team, and where the team list is duplicated
---

# Morocco ↔ Sweden swap

Current canonical state: **Morocco is a live team in Group D; Sweden is removed.**
Morocco replaced Sweden everywhere (Portugal is unrelated and stays). This reverses an
earlier swap that had removed Morocco in favour of Sweden — the direction has flipped,
so do not trust older notes claiming "Morocco is permanently removed".

Morocco identity: teamId `morocco`, name `Morocco`, code `MAR`, group `D`,
Discord roleId `1512180934026330365` (user-confirmed live role ID — NOT the
`1512921195107061890` value found in `.migration-backup`), logo `morocco.png`.

**Why roleId matters:** team detection (bot `getTeamForMember`, web `discordSync`)
maps Discord members to teams by roleId. Wrong/placeholder roleId = managers and
rosters silently not detected (this was the real cause of "Morocco managers can't use
/sign or /release" — Morocco simply wasn't a registered team).

The 16-team list is duplicated across many files — all must stay in sync when teams
change:
- bot: `data/teams.json`, `data/staff.json` (leadership map), `data/settings.json`
  (nationalTeamRoleNames), `config/configLoader.js` (DEFAULT_CONFIG list),
  `utils/dashboard.js` (TEAMS_PAGE_2)
- web: `lib/teamRoles.ts` (TEAMS), `components/GroupTabsClient.tsx` (FLAG_MAP),
  `app/(shell)/world-cup/page.tsx` (FLAG_MAP)
- crest PNG must exist in BOTH `artifacts/rsa-ops/public/assets/` AND `bot/assets/`
  (source crests live in `.migration-backup/bot/assets/`).

**Removed `removeMorocco()`:** `lib/teamRoles.ts` previously had a `removeMorocco()`
that hard-deleted any Morocco team; it was called from `leagueSetup.ts` and
`discordSync.ts`. Deleted entirely — with Morocco canonical it would wipe the team on
every sync. `removeNonCanonicalTeams()` still runs and cleans up the now-orphaned
Sweden row automatically.

**How to apply:** when swapping the team roster, edit ALL files above, copy the crest
to both asset dirs, use the real Discord role ID, and never reintroduce a
name-targeted hard-delete for a team that is supposed to exist.
