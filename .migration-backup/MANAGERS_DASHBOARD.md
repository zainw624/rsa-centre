# Managers Dashboard Documentation

## Overview

The Managers Dashboard is a live, automatically-updated leadership tracking system that displays team management information in real-time. It syncs seamlessly with the LeagueMonitor and provides comprehensive insights into team staffing status.

## Key Features

✅ **Live Updates** - Automatically updates when managers/assistants are assigned
✅ **Automatic Detection** - Detects role changes instantly, no manual updates needed
✅ **Beautiful Displays** - Color-coded status indicators for quick scanning
✅ **Team Information** - Shows managers, assistants, and vacancy status
✅ **Detailed Analytics** - Summary statistics and staffing rates
✅ **Zero Manual Work** - Fully automated, synced with Discord roles

## Dashboard Status Indicators

| Indicator | Status | Meaning |
|-----------|--------|---------|
| 🟢 | Fully Staffed | Manager and assistants assigned |
| 🟡 | Needs Assistants | Manager assigned, needs assistant coach(es) |
| 🟠 | Issues | Multiple managers or assistants detected |
| 🔴 | Vacant | No manager assigned |

## Commands

### `/managers dashboard`
Create or update the live managers leadership dashboard.

**Effect:**
- Creates `rsa-managers-dashboard` channel if it doesn't exist
- Sends/updates dashboard message with current leadership info
- Automatically tracks all future changes in that channel

**Usage:**
```
/managers dashboard
```

**Output:**
```
✅ Managers dashboard created in #rsa-managers-dashboard
```

**Dashboard Display:**
- 🟢 Fully Staffed: 8
- 🟡 Needs Assistants: 3
- 🔴 Vacant: 2
- 🟠 Issues: 1
- List of vacant positions
- Quick links to view details

---

### `/managers view [filter]`
View all team leadership information with optional filtering.

**Parameters:**
- `filter` (optional) - Filter by status:
  - `fully_staffed` - Only teams with manager and assistants
  - `needs_assistants` - Teams with manager but missing assistants
  - `vacant` - Teams with no manager
  - `all` (default) - Show all teams

**Usage:**
```
/managers view filter:vacant
```

**Output:**
Multiple embedded cards showing:
- Team name and code
- Status indicator with color
- Assigned manager(s)
- Assigned assistant(s)
- Vacancy status

---

### `/managers team <team_name>`
View detailed leadership information for a specific team.

**Parameters:**
- `team_name` (required) - Name of the team

**Usage:**
```
/managers team team_name:England
```

**Output:**
Single detailed card showing:
- Team logo (thumbnail)
- Team name and code
- Management status (🟢/🟡/🟠/🔴)
- Manager assignment with Discord mention
- Assistant assignment(s) with Discord mentions
- Vacancy status
- Color-coded by status

---

### `/managers summary`
View overall leadership statistics and staffing summary.

**Usage:**
```
/managers summary
```

**Output:**
Statistical summary showing:
- ✅ Fully Staffed Teams: 8
- 🟡 Needing Assistants: 3
- 🔴 Vacant Teams: 2
- 👥 Total Managers: 12
- 🎖️ Total Assistants: 18
- 📈 Staffing Rate: 73.3%
- Last updated timestamp

---

### `/managers vacancies`
View all open leadership positions.

**Usage:**
```
/managers vacancies
```

**Output:**
List of all teams needing staff with:
- Team name and code
- What positions are open (Manager/Assistant)
- First 10 shown, additional count if more exist

**Examples:**
```
⚠️ Vacant Positions — 5 team(s) need leadership

🔴 Brazil (BRA)
Needs: Manager

🔴 France (FRA)
Needs: Manager, Assistant

🟡 Spain (ESP)
Needs: Assistant
```

---

### `/managers refresh`
Manually refresh the leadership data and update the dashboard.

**Permissions:** Guild Manager+ required

**Usage:**
```
/managers refresh
```

**Output:**
```
✅ Leadership dashboard refreshed.
🟢 8 fully staffed | 🟡 3 need assistants | 🔴 2 vacant
```

**Effect:**
- Re-scans Discord roles for manager/assistant assignments
- Updates dashboard message with latest data
- Logs timestamp of refresh

---

## Automatic Updates

### Real-Time Sync

The dashboard automatically updates when:
1. **Roles Assigned** - Manager or Assistant role given to a user
2. **Roles Removed** - Manager or Assistant role removed from a user
3. **Role Changes** - User assigned to different team
4. **Team Role Changes** - Team role assignment changes

### Detection Method

The system monitors Discord's `guildMemberUpdate` event:
- Detects any role changes on guild members
- Checks if roles include manager/assistant/team roles
- Auto-updates dashboard if leadership changed
- Logs all updates for audit trail

## Data Structure

### Team Leadership Object
```json
{
  "teamName": "England",
  "teamCode": "ENG",
  "managers": [
    {
      "userId": "123456789",
      "username": "manager_user",
      "displayName": "Manager Name",
      "mention": "<@123456789>"
    }
  ],
  "assistants": [
    {
      "userId": "987654321",
      "username": "assistant_user",
      "displayName": "Assistant Name",
      "mention": "<@987654321>"
    }
  ],
  "status": "Fully Staffed",
  "statusIndicator": "🟢",
  "lastUpdated": "2026-06-06T14:30:00.000Z"
}
```

### Summary Object
```json
{
  "totalTeams": 11,
  "fullyStaffed": 8,
  "needingAssistants": 2,
  "vacant": 1,
  "multipleManagers": 0,
  "totalManagers": 12,
  "totalAssistants": 18,
  "lastUpdated": "2026-06-06T14:30:00.000Z"
}
```

## Files & Implementation

### Core Components

1. **[services/ManagersDashboard.js](services/ManagersDashboard.js)**
   - Main dashboard manager service
   - Tracks leadership data and syncs with LeagueMonitor
   - Methods:
     - `initialize()` - Load dashboard state
     - `updateLeadership(guild)` - Fetch and update leadership data
     - `getLeadership()` - Get all team leadership
     - `getTeamLeadership(teamName)` - Get specific team
     - `getFullyStaffedTeams()` - Filter fully staffed
     - `getVacantTeams()` - Filter vacant positions
     - `getSummary()` - Get statistics
     - `hasChanges(newLeadership)` - Detect changes
     - `sync()` - Save to storage

2. **[storage/ManagersDashboardStore.js](storage/ManagersDashboardStore.js)**
   - Persistent storage using JsonStorage
   - Stores dashboard location and team info

3. **[commands/managers.js](commands/managers.js)**
   - 6 subcommands for user interaction
   - Automatic dashboard creation
   - Team filtering and viewing

4. **[utils/managers.js](utils/managers.js)**
   - Embed builders for rich displays
   - Color-coded embeds
   - Status-specific formatting
   - Summary statistics display

5. **[events/managersAutoUpdate.js](events/managersAutoUpdate.js)**
   - Auto-detection on role changes
   - Automatic dashboard updates
   - Listens to `guildMemberUpdate` events

6. **[data/managersDashboard.json](data/managersDashboard.json)**
   - Persistent dashboard state storage

## Status Meanings

### 🟢 Fully Staffed
- Manager assigned: ✅
- Assistant(s) assigned: ✅
- Status: Ready for action

### 🟡 Needs Assistants
- Manager assigned: ✅
- Assistant(s) assigned: ❌
- Status: Operational but needs support

### 🟠 Issues Detected
- Multiple managers: ⚠️
- OR multiple assistants: ⚠️
- Status: Review required

### 🔴 Vacant
- Manager assigned: ❌
- Assistant(s) assigned: Any
- Status: Immediate action required

## Integration with LeagueMonitor

The ManagersDashboard syncs with the LeagueMonitor system:

1. **Data Access** - Uses scanLeadership() from LeagueMonitor
2. **Role Scanning** - Scans manager and assistant roles
3. **Team Mapping** - Maps roles to team assignments
4. **Conflict Detection** - Identifies managers on multiple teams

### Example Integration
```javascript
// In other commands or systems
const leadership = client.managersDashboard.getLeadership();
const summary = client.managersDashboard.getSummary();
const teams = client.managersDashboard.getVacantTeams();
```

## Auto-Update Examples

### Example 1: Manager Assigned
1. User receives "RSA | Managers" role
2. User receives "England" team role
3. System detects role change
4. Dashboard updates automatically
5. England status changes to 🟢 or 🟡
6. Dashboard message is edited

### Example 2: Assistant Removed
1. User loses "RSA | Assistant Managers" role
2. System detects role removal
3. Team status checked
4. Dashboard updates if vacancy created
5. Team status changes to 🟡

### Example 3: New Manager Added
1. New manager is recruited
2. Manager role and team role assigned
3. System detects new roles
4. Dashboard fetches full team list
5. Team moves to 🟢 if fully staffed

## Best Practices

### Regular Monitoring
✅ Check `/managers summary` before major events
✅ Review `/managers vacancies` weekly
✅ Use filters to focus on problem areas
✅ Monitor staffing rate trend

### Staffing Management
✅ Fill 🔴 vacant positions first
✅ Then address 🟡 teams needing assistants
✅ Maintain 🟠 issue teams
✅ Keep 🟢 teams fully staffed

### Dashboard Usage
✅ Create dashboard in important channel
✅ Pin dashboard message for quick access
✅ Use `/managers refresh` before big events
✅ Review vacancies regularly

## Troubleshooting

### Dashboard Not Updating
**Symptom:** Manual role changes don't update dashboard

**Solutions:**
1. Use `/managers refresh` to force update
2. Check that ManagersDashboard initialized
3. Verify roles are being assigned in Discord
4. Check bot permissions in channel

### Missing Teams
**Symptom:** Some teams don't appear in leadership data

**Solutions:**
1. Ensure teams are in teams.json
2. Verify team roles exist in Discord
3. Check role naming consistency
4. Run `/managers refresh`

### Incorrect Status
**Symptom:** Team shows wrong staffing status

**Solutions:**
1. Verify role assignments in Discord
2. Check for duplicate roles
3. Run `/managers refresh`
4. Manually verify role setup

## Future Enhancements

Planned features:
- Staffing trend graphs
- Historical leadership changes log
- Automated recruitment alerts
- Manager performance metrics
- Export leadership report
- Integration with contract system

## Usage Examples

### Setup Dashboard
```
/managers dashboard
```
Creates the live dashboard in a dedicated channel.

### Check Vacant Teams
```
/managers vacancies
```
Shows all open positions needing to be filled.

### View Specific Team
```
/managers team team_name:Brazil
```
Shows Brazil's current manager and assistants.

### Get Summary Stats
```
/managers summary
```
Shows overall staffing statistics.

### Filter by Status
```
/managers view filter:needs_assistants
```
Shows all teams that have a manager but need assistants.

---

**Created:** 2026-06-06
**Version:** 1.0
**Status:** Production Ready
**Sync Status:** ✅ LeagueMonitor Integrated
