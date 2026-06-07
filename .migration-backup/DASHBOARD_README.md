
# 🌍 RSA National Team Leadership Dashboard

## Overview

The **RSA National Team Leadership Dashboard** is a fully autonomous, self-updating management portal that tracks all National Team managers and assistant managers in real-time.

Once deployed, the dashboard:
- 🤖 Automatically detects leadership roles
- 📊 Creates a professional management dashboard
- 🔄 Self-updates when roles change
- ♻️ Auto-recreates if the message is deleted
- 📢 Logs all leadership changes
- 🚨 Detects and reports leadership conflicts

## Setup

### 1. Initial Dashboard Creation

Simply run the command once:

```
/managers
```

This will:
- Create a `#rsa-management-dashboard` channel (if it doesn't exist)
- Create the initial dashboard message with all 16 teams
- Save the dashboard configuration
- Begin automatic monitoring

### 2. What Happens Behind the Scenes

The bot immediately begins:
- Scanning all guild members
- Identifying managers (users with both "RSA | Managers" role + a national team role)
- Identifying assistant managers (users with both "RSA | Assistant Managers" role + a national team role)
- Building the dashboard with current team statuses
- Listening for member/role changes to update automatically

## How Leadership Detection Works

### Manager Detection
A user is a **manager** when they have:
- ✅ "RSA | Managers" role
- ✅ One national team role (e.g., Spain, France, etc.)

### Assistant Manager Detection
A user is an **assistant manager** when they have:
- ✅ "RSA | Assistant Managers" role  
- ✅ One national team role (e.g., Spain, France, etc.)

### Team Status Indicators

| Indicator | Status | Meaning |
|-----------|--------|---------|
| 🟢 | Fully Staffed | Manager + Assistant Manager present |
| 🟡 | Assistant Needed | Manager exists, but needs an Assistant |
| 🔴 | Vacant Team | No manager assigned |
| 🟠 | Staffing Issue | Multiple managers or assistants detected |
| 🚨 | Leadership Conflict | User has multiple team roles |

## Dashboard Features

### Team Cards

Each team displays:
```
🟢 Spain
Status: Fully Staffed
Manager: @SpainManager
Assistant: @SpainAssistant
Last Updated: 5 minutes ago
```

### Statistics Panel

Live statistics including:
- 📊 Total Teams (16)
- 👤 Active Managers
- 👤 Active Assistant Managers
- 🔴 Vacant Teams
- 🟡 Teams Needing Assistants
- 🚨 Active Conflicts
- 🟢 System Status
- 🕒 Last Updated Timestamp

### Activity Feed

Recent 10 events with timestamps:
- 🟢 Manager Assigned
- 🔴 Manager Removed
- 🟡 Assistant Needed
- 🟢 Team Fully Staffed
- 🚨 Leadership Conflict Detected

### Pagination

Two pages with navigation buttons:
- **Page 1**: Belgium, Brazil, Croatia, England, France, Germany, Ghana, Japan
- **Page 2**: Morocco, Netherlands, Norway, Senegal, Spain, Sweden, Türkiye, USA

Buttons:
- ◀ Previous (disabled on page 1)
- 🔄 Refresh (re-scan and update)
- Next ▶ (disabled on page 2)

## Automatic Updates

The dashboard automatically refreshes when:

### Member Changes
- User joins the guild
- User leaves the guild
- User roles change

### Role Changes
- New role created
- Role deleted
- Role modified/renamed

### System Events
- Bot restart (ready event)
- Manual refresh (🔄 button)

### Update Cooldown

To prevent spam and batched updates, the dashboard has a **5-second cooldown** between refreshes. Multiple rapid changes are batched into a single update.

## Dashboard Recovery

### Message Deleted?
If the dashboard message is deleted, the bot will:
1. Detect the missing message
2. Automatically recreate it in the same channel
3. Log "Dashboard Recreated" in activity feed

### Channel Deleted?
If the dashboard channel is deleted, the bot will:
1. Log an error
2. Wait for the next `/managers` command
3. Create a new channel when `/managers` is run again

## Activity Logging

All leadership changes are logged to `data/leadership-activity.json`:

```json
{
  "events": [
    {
      "id": "abc123",
      "emoji": "🟢",
      "text": "Spain Manager Assigned: JohnDoe",
      "type": "managerAssigned",
      "team": "Spain",
      "timestamp": "2026-06-06T15:30:45.123Z"
    }
  ]
}
```

Events logged include:
- Manager assignments/removals
- Assistant assignments/removals
- Status changes
- Dashboard creation/updates
- Leadership conflicts

## Conflict Detection

### Multiple Managers (🟠)
If two users both have "RSA | Managers" role + Spain team role:
- Dashboard shows "🟠 Multiple Managers Detected"
- Error logged to console with usernames
- Activity event recorded

### Multiple Assistants (🟠)
If two users both have "RSA | Assistant Managers" role + Spain team role:
- Dashboard shows "🟠 Multiple Assistants Detected"
- Error logged to console
- Activity event recorded

### Leadership Conflict (🚨)
If a user has "RSA | Managers" + multiple team roles (e.g., Spain AND England):
- Dashboard shows "🚨 Leadership Conflict Detected"
- Console warning with user details
- Activity event with conflict details recorded

## Storage

Dashboard data is stored in `data/`:

**dashboard.json**
```json
{
  "guildId": "123456789",
  "channelId": "987654321",
  "messageId": "111111111",
  "currentPage": 0,
  "createdAt": "2026-06-06T15:00:00.000Z",
  "lastUpdated": "2026-06-06T15:30:45.123Z"
}
```

**leadership-activity.json**
```json
{
  "events": [... up to 20 recent events ...]
}
```

## Technical Details

### Files Created

- `commands/managers.js` - Main slash command
- `utils/leadership.js` - Leadership detection & analysis
- `utils/dashboardStorage.js` - Dashboard persistence
- `utils/dashboard.js` - Dashboard rendering
- `events/dashboardButtons.js` - Pagination button handling
- `events/dashboardAutoUpdate.js` - Auto-update on role/member changes

### Required Intents

The bot requires these Discord.js intents:
- `Guilds` - Guild access
- `GuildMembers` - Member information
- `GuildRoles` - Role tracking

These are automatically configured in `main.js`.

### Database Files

- `data/dashboard.json` - Dashboard configuration
- `data/leadership-activity.json` - Activity log

### Role Requirements

To use `/managers`:
- You must be the **Bot Owner** (configured in `settings.json`)

## Professional Branding

The dashboard features:
- ✅ RSA logo as author/footer icon
- ✅ Professional color scheme (#1f1f1f)
- ✅ Team-specific logos
- ✅ Tournament operations center aesthetic
- ✅ No AI references or disclaimers
- ✅ Official RSA branding throughout

## Troubleshooting

### Dashboard Not Updating?

1. Check if dashboard channel still exists
2. Check if bot has permissions to edit messages
3. Check if team roles exist in guild
4. Check bot console for errors

### Managers Not Detected?

1. Verify users have "RSA | Managers" role
2. Verify users have national team role
3. Run `/managers` to force scan
4. Check console for role lookup errors

### Activity Feed Not Showing?

1. Check `data/leadership-activity.json` exists
2. New dashboard needs events to populate feed
3. Feed shows last 10 events only

## Commands

### /managers
Run once to create/update the leadership dashboard.

**Usage:**
```
/managers
```

**Output:**
```
✅ Leadership Dashboard created!

📍 Channel: #rsa-management-dashboard
📊 Dashboard Active in <#987654321>
```

## Support

For issues or questions:
1. Check console logs for errors
2. Verify role names match exactly
3. Ensure all required intents are enabled
4. Check `data/` directory for log files

---

**Dashboard System** • Autonomous Leadership Detection • Professional RSA Management Portal
