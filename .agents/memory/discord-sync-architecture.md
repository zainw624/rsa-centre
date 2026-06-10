---
name: Discord sync architecture
description: How RSA Operations Centre keeps DB rosters/teams/managers/staff in sync with Discord roles, and why it's a hybrid.
---

# Discord ↔ database sync

**Hybrid by necessity.** The web app is deployed on Replit **autoscale**, which spins down when idle and cannot hold a persistent Discord gateway (WebSocket) connection. So real-time event sync must live in the separate bot (repo root `bot/`, deployed on Render), and the website can only do **pull-based** sync.

**Three entry points, one source of truth:**
- `POST /api/roles-sync` — secure push from the bot (header `x-sync-secret` == `ROLES_SYNC_SECRET`), per-member.
- `POST /api/admin/sync-discord` — website admin "Sync Discord Now" button (session-gated owner/administrator/league).
- **Automatic background sync** (`instrumentation.ts`) — the primary, login-free path. On every server boot (`NEXT_RUNTIME==='nodejs'`) it runs `seedSeasonGroups()` + `syncAllFromDiscord()` ~4s after start, then on an interval (`AUTO_DISCORD_SYNC_MINUTES`, default 10; disable with `AUTO_DISCORD_SYNC=off`). Guarded by `globalThis` flags against overlap/double-start; `timer.unref()` so it doesn't pin the process. This is what makes members appear because they're roled in Discord, NOT because they logged in.
- The bulk full-pull logic is the shared **`syncAllFromDiscord()`** in `lib/discordSync.ts` (fetchGuildRoles + paginated `fetchAllGuildMembers()` → per-tracked-member `syncMemberRoles()` → reconcile). Admin route and instrumentation both call it; **never fork it.** `fetchAllGuildMembers` needs the bot's SERVER MEMBERS INTENT enabled.
- Season/group standings seeding extracted to `seedSeasonGroups()` in `lib/leagueSetup.ts` (Season 2026 + one empty `LeagueTable` row per team in its A–D group). "Seed groups" = this; it just creates the empty World-Cup group standings, independent of rosters.

**Rules enforced in `syncMemberRoles`:**
- Team **role IDs are the only source of truth** (no role-name fallback). Resolve in canonical `TEAMS` order so multi-role anomalies pick a deterministic single team.
- A member is on **at most one** active roster; Free Agents (no team role) are never rostered.
- Bulk sync reconciles removals: active roster/manager rows whose owner isn't in the processed tracked-member set get deactivated (covers left-guild / lost-role). `syncAllFromDiscord` additionally **clears `User.roles`/permission** for any DB user not in the processed set, so Staff/Leadership pages don't show ghosts after someone loses all tracked roles or leaves.

**Canonical team data** lives in `lib/teamRoles.ts` (`TEAMS` = 16 teams with name/code/group/roleId/flag, `FREE_AGENT_ROLE_ID`, aliases USA→United States, Turkiye→Türkiye). `ensureTeams()` upserts them with role IDs+logos; `removeMorocco()` is FK-ordered cleanup (Morocco was permanently replaced by Sweden; logos use `/assets/<flag>.png`, all full-name slugs exist).

**Why:** keeps the live bot and the on-demand website refresh behaviorally identical and makes the website able to backfill/repair rosters without waiting on the bot.
