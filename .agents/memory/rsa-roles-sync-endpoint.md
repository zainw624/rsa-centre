---
name: RSA roles-sync endpoint
description: Secure bot-facing role push endpoint at POST /api/roles-sync
---

Endpoint: `POST /api/roles-sync` (artifacts/rsa-ops/app/api/roles-sync/route.ts)
Bot integration kit: `artifacts/rsa-ops/bot-integration/`

Auth: `x-sync-secret` header must match `ROLES_SYNC_SECRET` env var.
Guild: `guildId` in body validated against `DISCORD_GUILD_ID`.

Payload the bot sends:
```json
{ "discordId", "username?", "displayName?", "avatar?",
  "roleIds": [], "roleNames": [], "guildId", "event", "timestamp" }
```

What the endpoint does:
1. Reuses `resolvePermission()` from `lib/discord.ts` for permission mapping
2. Upserts User by discordId (name, image, roles[], permission)
3. Syncs RosterPlayer — matches Team.roleId or teamName/teamCode against roleIds/roleNames
4. Syncs ManagerAssignment — detects "RSA | Managers"/"RSA | Assistant Managers"
5. Handles `member_leave` event (deactivates roster + manager rows)
6. Writes AuditLog entry on every sync

Response: `{ ok, event, permission, rolesStored, teamsJoined, teamsLeft }`

Bot env vars needed: WEBSITE_URL, ROLES_SYNC_SECRET, BOT_OWNER_ID
Website secrets needed: ROLES_SYNC_SECRET (Tools → Secrets)

**Why:** Bot needs to push role changes into the DB so the website reflects live Discord state without polling.

**How to apply:** Any new role-detection logic should be added to `lib/discord.ts#resolvePermission` so both login (auth.ts) and the push endpoint stay in sync.
