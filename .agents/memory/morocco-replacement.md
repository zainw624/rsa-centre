---
name: Morocco permanently replaced
description: Morocco must not exist anywhere; replaced by Sweden/Portugal
---

# Morocco replacement

Morocco is permanently removed from the RSA competition. The canonical 16 teams live in
`lib/teamRoles.ts` (web) and `bot/data/teams.json` (bot). Group C = Portugal, England,
France, Spain. Sweden lives in Group D.

Bot-side team lists are duplicated across `data/teams.json`, `data/staff.json`,
`data/settings.json`, `config/configLoader.js`, `utils/dashboard.js` — all must stay in
sync when teams change. `USA` displays as "United States" (teamCode still "USA").

Web `lib/teamRoles.ts` keeps a `removeMorocco()` cleanup that seed-groups/sync-discord
call — that's intentional, leave it.

**Why:** prompt requirement; Morocco data lingered in several bot files after the
nominal swap.

**How to apply:** when changing the team roster, update ALL the bot list files above
plus `teamRoles.ts`, and add the flag/crest PNG to both `artifacts/rsa-ops/public/assets`
and `bot/assets`.
