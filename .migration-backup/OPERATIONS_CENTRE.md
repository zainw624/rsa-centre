# RSA Operations Centre Documentation

## Overview

The RSA Operations Centre is the unified command and control hub for the entire Roblox Soccer Association. It provides a single, constantly-updated dashboard with real-time information from all systems, accessible through a beautiful website-style interface with intuitive navigation.

**Key Features:**
✅ **14 Comprehensive Pages** - Dashboard, Teams, Managers, Staff, Rosters, Transfers, Discipline, Fixtures, Results, World Cup, Statistics, Compliance, Activity, and System
✅ **Auto-Deployment** - Single `/dashboard` command deploys the entire centre
✅ **Auto-Preservation** - Automatically recreates dashboard if deleted
✅ **Auto-Synchronization** - Updates continuously from all connected systems
✅ **Zero Manual Refreshes** - Every page updates automatically
✅ **Website-Style Navigation** - 14 button groups for seamless page switching
✅ **RSA Branding** - Uses rsa.png and team logos from assets
✅ **System Integration** - Syncs with all managers, compliance engine, results, transfers, and more

---

## Quick Start

### Deploy the Operations Centre

```
/dashboard
```

**What it does:**
1. Creates `rsa-operations-centre` channel (if not exists)
2. Deploys live dashboard with all pages
3. Saves message ID for auto-preservation
4. Begins automatic synchronization
5. Ready for immediate use

**Output:**
```
✅ Operations Centre Deployed

📍 Channel: #rsa-operations-centre
💾 Message ID: [saved]

🎯 The dashboard is now live and will automatically 
update with all system changes.
```

---

## Dashboard Pages

### 🏠 Page 0: Dashboard (Home)
**Shows:** System overview and status
- System health status (Database, Cache, Sync)
- Quick statistics (Teams, Managers, Players)
- Recent activity log
- Central hub for navigation

**Auto-Updates From:** All systems

### 🌍 Page 1: Teams
**Shows:** All registered teams
- Team list with team codes
- Current roster counts vs limit
- Team assignment status
- Statistics summary

**Auto-Updates From:** LeagueMonitor, TeamManager

### 👥 Page 2: Managers (Leadership)
**Shows:** Management staff assignments
- Staffing status breakdown (Fully Staffed / Needs Assistants / Vacant)
- Team-by-team management status
- Manager and assistant counts
- Color-coded status indicators

**Auto-Updates From:** ManagersDashboard, guildMemberUpdate events

### 👥 Page 3: Staff
**Shows:** All staff information
- Total managers registered
- Total assistants registered
- Management team list
- Staff assignment tracking

**Auto-Updates From:** LeagueMonitor, StaffManager

### 📋 Page 4: Rosters
**Shows:** Team roster information
- Roster fill levels (visual bars)
- Players per team vs limit
- Oversized rosters detection
- Empty team identification

**Auto-Updates From:** LeagueMonitor, TeamManager, ComplianceEngine

### 🔄 Page 5: Transfers
**Shows:** Transfer system status
- Pending transfers count
- Completed transfers count
- Rejected transfers count
- Recent transfer list

**Auto-Updates From:** TransferManager, transfer events

### ⚖️ Page 6: Discipline
**Shows:** Disciplinary actions
- Active suspensions
- Active sanctions
- Recent disciplinary records
- Violation tracking

**Auto-Updates From:** ComplianceManager, discipline events

### 📅 Page 7: Fixtures
**Shows:** Match fixture information
- Upcoming matches count
- Completed matches count
- Next scheduled matches
- Schedule status

**Auto-Updates From:** FixtureManager, fixture events

### 📖 Page 8: Results
**Shows:** Match results database
- Total results recorded
- Recent match results
- Score tracking
- Results by team

**Auto-Updates From:** ResultsManager, results events

### 🏆 Page 9: World Cup
**Shows:** World Cup mode information
- World Cup status (Active/Inactive)
- International teams count
- Tournament phase and groups
- WC-specific configuration

**Auto-Updates From:** LeagueMonitor settings, World Cup events

### 📊 Page 10: Statistics
**Shows:** System-wide analytics
- Total teams, players, matches, goals
- Trend analysis
- Top performers
- Performance metrics
- Goals per match averages

**Auto-Updates From:** All systems, aggregated

### 🚨 Page 11: Compliance
**Shows:** Compliance violation tracking
- Critical violations count
- High/Medium/Low violations
- Focus areas and issues
- Last compliance scan time

**Auto-Updates From:** ComplianceEngine, compliance scan events

### 📜 Page 12: Activity
**Shows:** Recent system activity log
- Timestamped events
- System actions
- User actions
- Real-time activity stream

**Auto-Updates From:** All systems, activity logger

### ⚙️ Page 13: System
**Shows:** System information and health
- System status (All systems operational)
- Bot uptime
- Last synchronization time
- Module status (✅/❌)
- API and webhook status

**Auto-Updates From:** LeagueMonitor, system events

---

## Automatic Features

### ✅ Auto-Deployment
Single command deploys everything:
```
/dashboard
```
- Creates dedicated channel
- Sends full dashboard
- Sets up all systems
- Begins auto-sync

### ✅ Auto-Preservation
Dashboard automatically recreates if deleted:
1. Message deleted
2. System detects deletion
3. New message created
4. Message ID updated
5. All content restored

**No manual action needed** - dashboard is always there

### ✅ Auto-Synchronization
Updates automatically from multiple triggers:

**Continuous Sync** (Every 5 minutes)
- All pages refreshed
- New data fetched from systems
- Embeds regenerated
- Changes applied

**Event-Triggered Sync**
- Manager/assistant roles change → Pages 2, 3 update
- Transfer approved → Page 5 updates
- Match result added → Pages 8, 10 update
- Compliance scan → Page 11 updates
- Roster changes → Page 4 updates
- Fixtures added → Page 7 updates

**Result:** Dashboard is always current

---

## Navigation System

### 14 Navigation Buttons
Organized in 3 rows:
- **Row 1:** 🏠 Dashboard | 🌍 Teams | 👥 Managers | 👥 Staff | 📋 Rosters
- **Row 2:** 🔄 Transfers | ⚖ Discipline | 📅 Fixtures | 📖 Results | 🏆 World Cup
- **Row 3:** 📊 Statistics | 🚨 Compliance | 📜 Activity | ⚙ System

### How to Navigate
1. Click any button to view that page
2. Button becomes disabled (shows you're on that page)
3. Page embeds and content update instantly
4. Click another button to switch pages
5. No loading delays - instant switching

### Button Disabled State
Current page button shows as disabled (grayed out) so you always know which page you're viewing.

---

## System Integration

### Connected Systems
The Operations Centre automatically syncs with:
1. **LeagueMonitor** - Team, staff, and league data
2. **ManagersDashboard** - Leadership tracking
3. **ResultsManager** - Match results
4. **ComplianceEngine** - Violation detection
5. **TransferManager** - Transfer processing
6. **FixtureManager** - Match scheduling
7. **TeamManager** - Roster management
8. **StaffManager** - Staff assignments
9. **ComplianceManager** - Disciplinary records
10. **ActivityLogger** - System events

### Data Flow
```
[System] → [Event/Update] → [Activity Logger] → [Operations Centre] → [Dashboard Update]
```

Each system change is:
1. Logged to activity stream
2. Detected by sync listener
3. Applied to relevant pages
4. Reflected in dashboard within seconds

---

## Auto-Update Examples

### Example 1: Manager Assigned
1. User receives "RSA | Managers" role
2. User receives team role (e.g., "England")
3. guildMemberUpdate event triggers
4. ManagersDashboard.updateLeadership() called
5. Pages 2 (Managers), 3 (Staff) refresh
6. Dashboard updated within seconds
7. Status changes from 🔴 to 🟢 or 🟡

### Example 2: Transfer Approved
1. Transfer command approves transfer
2. TransferManager processes approval
3. Activity logged
4. Page 5 (Transfers) auto-refreshes
5. Pending count decreases
6. Completed count increases
7. Recent transfers list updates

### Example 3: Compliance Scan
1. Compliance scan completes (every 6 hours)
2. Violations detected and logged
3. ComplianceEngine updates
4. Page 11 (Compliance) refreshes
5. Violation counts update
6. Critical alerts displayed

### Example 4: Match Result Added
1. Result added via `/results add`
2. ResultsManager processes
3. Activity logged
4. Pages 8 (Results) and 10 (Statistics) refresh
5. Goal totals update
6. Recent results list updates
7. Team statistics recalculated

---

## Technical Details

### Storage
**File:** `data/operationsCenter.json`

```json
{
  "guildId": "123456789",
  "channelId": "987654321",
  "messageId": "555555555",
  "currentPage": 0,
  "lastUpdated": "2026-06-06T14:30:00.000Z",
  "createdAt": "2026-06-06T12:00:00.000Z"
}
```

### Service
**File:** `services/OperationsCenter.js`

**Key Methods:**
- `initialize()` - Load state from storage
- `buildPage(pageIndex, client)` - Build any page
- `changePage(newPageIndex)` - Switch pages
- `getNavigationButtons(pageIndex)` - Get button rows
- `setDashboardInfo(guildId, channelId, messageId)` - Save location
- `logActivity(text)` - Log to activity stream
- `getDashboardInfo()` - Get dashboard location
- `getCurrentPage()` - Get current page index

### Page Builders
**File:** `utils/operationsCenter.js`

14 embed builders, each returns EmbedBuilder:
- `buildDashboardPage(systems)` - Page 0
- `buildTeamsPage(teams)` - Page 1
- `buildManagersPage(leadership)` - Page 2
- `buildStaffPage(staff)` - Page 3
- `buildRostersPage(teams)` - Page 4
- `buildTransfersPage(transfers)` - Page 5
- `buildDisciplinePage(violations)` - Page 6
- `buildFixturesPage(fixtures)` - Page 7
- `buildResultsPage(results)` - Page 8
- `buildWorldCupPage(settings)` - Page 9
- `buildStatisticsPage(stats)` - Page 10
- `buildCompliancePage(compliance)` - Page 11
- `buildActivityPage(activities)` - Page 12
- `buildSystemPage(leagueMonitor)` - Page 13

### Event Handlers
1. **operationsCentreNavigation.js** - Button click handling
2. **operationsCentreAutoRecreate.js** - Auto-recreation on delete
3. **operationsCentreAutoSync.js** - Continuous synchronization

---

## Branding & Styling

### RSA Logo
- **File:** `assets/rsa.png`
- **Usage:** Dashboard thumbnail (Page 0)

### Team Logos
- **Location:** `assets/` folder
- **Available:** For all teams
- **Used:** In team-specific displays (future enhancement)

### Color Scheme
- **Background:** Dark theme (#1f1f1f base)
- **Primary Colors:** Team-specific colors from league data
- **Status Colors:**
  - 🟢 Green (#00B37E) - Fully staffed, operational
  - 🟡 Gold (#FFD700) - Needs attention
  - 🟠 Orange (#FFA500) - Issues detected
  - 🔴 Red (#FF0000) - Critical/vacant

---

## Best Practices

### Regular Monitoring
✅ Check Dashboard page daily for system health
✅ Review Compliance page regularly for violations
✅ Monitor Activity page for anomalies
✅ Check System page for uptime and sync status

### Using the Dashboard
✅ Bookmark the Operations Centre channel
✅ Pin the dashboard message for easy access
✅ Use mobile app for remote monitoring
✅ Share specific pages with relevant staff

### Integration Tips
✅ Reference Operations Centre when investigating issues
✅ Use Activity log for audit trails
✅ Monitor Compliance page before events
✅ Check Statistics for performance trends

---

## Troubleshooting

### Dashboard Not Updating
**Symptom:** Pages show old data

**Solutions:**
1. Wait 5 minutes for next auto-sync
2. Switch pages to trigger refresh
3. Use `/dashboard` to redeploy
4. Check System page for sync status
5. Check bot logs for errors

### Missing Page Content
**Symptom:** Page shows "No data" or empty fields

**Solutions:**
1. Verify underlying system initialized (check Activity log)
2. Ensure data exists in that system
3. Check System page to see if that module is ✅
4. Run relevant system command (e.g., `/managers summary`)

### Dashboard Message Deleted
**Symptom:** Dashboard message gone

**Solution:**
1. It auto-recreates within 30 seconds
2. You can manually redeploy with `/dashboard`
3. Check channel - message should reappear

### Button Not Responding
**Symptom:** Clicking buttons does nothing

**Solutions:**
1. Check you have access to the channel
2. Try refreshing/reloading Discord
3. Redeploy dashboard with `/dashboard`
4. Check bot permissions in the channel

---

## Future Enhancements

Planned features:
- [ ] Export dashboard to PDF report
- [ ] Archive historical views
- [ ] Custom page themes
- [ ] Mobile-optimized display
- [ ] Real-time notification bells
- [ ] Page interaction history
- [ ] Custom dashboard filters
- [ ] Team-specific dashboards
- [ ] Performance graphs
- [ ] Prediction models

---

## Files Created

### Core Files
1. **services/OperationsCenter.js** - Main service (11 methods)
2. **storage/OperationsCenterStore.js** - Persistent storage
3. **utils/operationsCenter.js** - 14 page builders + navigation
4. **commands/dashboard.js** - Deployment command
5. **data/operationsCenter.json** - State storage
6. **events/operationsCentreNavigation.js** - Button handler
7. **events/operationsCentreAutoRecreate.js** - Auto-recreation
8. **events/operationsCentreAutoSync.js** - Auto-sync system

### Modified Files
1. **services/index.js** - Added OperationsCenter export
2. **main.js** - Added initialization and event loading

---

## Status

✅ **Implementation Complete**
✅ **All 14 Pages Built**
✅ **Navigation System Active**
✅ **Auto-Sync Enabled**
✅ **Auto-Preservation Enabled**
✅ **Full System Integration**
✅ **Production Ready**

**Version:** 1.0
**Release Date:** 2026-06-06
**Status:** Live and Operational
