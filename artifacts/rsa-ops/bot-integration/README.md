# RSA Bot Integration — Role Sync

These files give your Discord bot the ability to push role updates to the RSA Operations Centre website automatically.

## Files

| File | Purpose |
|------|---------|
| `role-sync-helper.js` | Core helper — `pushRoleSync()` and `pushMemberLeave()` functions |
| `events/guildMemberUpdate.js` | Updated event handler that calls `pushRoleSync` on role changes |
| `events/guildMemberAdd.js` | Calls `pushRoleSync` when a new member joins |
| `events/guildMemberRemove.js` | Calls `pushMemberLeave` when a member leaves |
| `commands/syncroles.js` | `/syncroles` slash command for manual syncing |

## Setup

### 1 — Add Replit Secrets to the website

In the **website's** Replit project (Tools → Secrets):

| Secret name | Value |
|-------------|-------|
| `ROLES_SYNC_SECRET` | A long random string — generate with: `openssl rand -base64 32` |

### 2 — Add env vars to the bot

In your **bot's** environment (wherever you run it):

| Variable | Value |
|----------|-------|
| `WEBSITE_URL` | Your Replit app URL, e.g. `https://rsa-ops.replit.app` |
| `ROLES_SYNC_SECRET` | **Exactly the same value** as set on the website |
| `BOT_OWNER_ID` | Your Discord user ID |

### 3 — Copy files into your bot project

Copy these files into your Discord bot:

```
your-bot/
  role-sync-helper.js          ← copy from bot-integration/
  events/
    guildMemberUpdate.js       ← merge with your existing handler
    guildMemberAdd.js          ← add if you don't have one
    guildMemberRemove.js       ← add if you don't have one
  commands/
    syncroles.js               ← register as a slash command
```

> **Important:** The `guildMemberUpdate.js` in this folder is a **template**. If you already have a `guildMemberUpdate` handler (the original bot has one), add the `pushRoleSync` call to it rather than replacing the whole file.

### 4 — Register the slash command

If your bot uses `discord.js` slash command registration, add `syncroles` to your command deploy script alongside your existing commands.

## How it works

```
Discord server
  └─ Role changes, joins, leaves
       └─ Bot event fires
            └─ pushRoleSync(member) called
                 └─ POST https://rsa-ops.replit.app/api/roles-sync
                      Header: x-sync-secret: <ROLES_SYNC_SECRET>
                      Body: { discordId, roleIds, roleNames, guildId, event, ... }
                           └─ Website validates secret + guild
                                └─ Updates User.roles, User.permission
                                └─ Syncs RosterPlayer entries
                                └─ Syncs ManagerAssignment entries
                                └─ Writes to AuditLog
                                └─ Returns { ok, permission, rolesStored, teamsJoined }
```

## Security

- The endpoint rejects any request where `x-sync-secret` doesn't match `ROLES_SYNC_SECRET`
- The endpoint validates the `guildId` matches `DISCORD_GUILD_ID` (set on the website)
- The secret is never logged or exposed to frontend code
- Only the bot should know `ROLES_SYNC_SECRET`

## Role → Permission mapping

| Discord role | Website permission |
|-------------|-------------------|
| RSA \| Founders, RSA \| Co Founders | `administrator` |
| RSA \| Executive … RSA \| Developer | `league` |
| RSA \| Officials, RSA \| Panel | `results` |
| RSA \| Managers, RSA \| Assistant Managers | `manager` |
| `BOT_OWNER_ID` match | `owner` |
| Everyone else | `viewer` |

## Team roster sync

When the bot pushes a member update, the endpoint automatically:

- Looks up all teams in the database
- Matches Discord role IDs against `Team.roleId` (exact match)
- Falls back to matching role names against `Team.teamName` or `Team.teamCode`
- Adds the member to the correct team roster(s)
- Removes them from rosters of teams they no longer have a role for
