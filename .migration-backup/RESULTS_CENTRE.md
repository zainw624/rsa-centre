# Results Centre Documentation

## Overview
The Results Centre is a comprehensive system for managing and displaying match results within RSA (Roblox Soccer Association). It provides role-based access control, historical data storage, and integration with the dashboard.

## Features
✅ **Role-Based Permissions** - Only RSA | Officials and Bot Owner can manage results
✅ **Historical Storage** - All match results are stored permanently and sortable
✅ **Rich Displays** - Beautiful Discord embeds showing match details and statistics
✅ **Team Statistics** - View team-specific records, win rates, and goal differentials
✅ **Dashboard Sync** - Results are persistent and can be integrated with the dashboard

## Permissions

### Who Can Manage Results?
- **RSA | Officials** role
- **Bot Owner**
- Guild Owner

### Allowed Actions
- ✅ Add results
- ✅ Edit results
- ✅ Remove results

### Everyone Else
- 📖 View only (read access to all commands)

## Commands

### `/results add`
Add a new match result to the system.

**Required Parameters:**
- `home_team` - Name of the home team
- `away_team` - Name of the away team
- `home_score` - Home team score (0+)
- `away_score` - Away team score (0+)

**Optional Parameters:**
- `date` - Match date in YYYY-MM-DD format (defaults to today)
- `competition` - Competition name (defaults to "League")
- `stadium` - Stadium/venue name (defaults to "Unknown")
- `attendance` - Attendance number (0+)
- `notes` - Additional notes about the match

**Example:**
```
/results add home_team:England away_team:France home_score:2 away_score:1 competition:World Cup stadium:Wembley attendance:75000
```

### `/results edit`
Edit an existing match result. Only RSA | Officials and Bot Owner can use this.

**Required Parameters:**
- `result_id` - The ID of the result to edit

**Optional Parameters:**
- `home_score` - New home team score
- `away_score` - New away team score
- `notes` - Updated notes

**Note:** You can only edit scores and notes. Team names and dates cannot be changed. To modify other details, remove the result and add a new one.

**Example:**
```
/results edit result_id:result_1717632000000 home_score:3 away_score:1
```

### `/results remove`
Remove a match result from the system. Only RSA | Officials and Bot Owner can use this.

**Required Parameters:**
- `result_id` - The ID of the result to remove

**Example:**
```
/results remove result_id:result_1717632000000
```

### `/results view`
Display the 10 most recent match results.

**Usage:**
```
/results view
```

**Output:** Shows a formatted list of recent results with:
- Team names and scores
- Match status (Win/Draw/Loss indicated by colored squares)
- Match dates

### `/results team`
View all results for a specific team, including statistics.

**Required Parameters:**
- `team_name` - Name of the team to view results for

**Usage:**
```
/results team team_name:England
```

**Output:** Shows:
- Team name and result history
- Win/Draw/Loss record
- Goal differential
- Win rate percentage
- Recent match details

## Data Structure

Each result is stored with the following structure:

```json
{
  "id": "result_1717632000000",
  "homeTeam": "England",
  "awayTeam": "France",
  "homeScore": 2,
  "awayScore": 1,
  "date": "2026-06-06T14:30:00.000Z",
  "competition": "World Cup",
  "stadium": "Wembley",
  "attendance": 75000,
  "notes": "Excellent performance by the team",
  "addedBy": "user_id_here",
  "addedAt": "2026-06-06T15:45:23.000Z",
  "editedBy": "user_id_here",
  "editedAt": "2026-06-06T16:20:15.000Z"
}
```

## Files & Implementation

### Core Components

1. **[storage/ResultsStore.js](storage/ResultsStore.js)**
   - Handles persistent data storage to `data/results.json`
   - Uses JsonStorage for data management
   - Default structure includes empty results array

2. **[services/ResultsManager.js](services/ResultsManager.js)**
   - Business logic for managing results
   - Methods:
     - `initialize()` - Load results from storage
     - `addResult(resultData)` - Add new result
     - `editResult(resultId, updates)` - Update existing result
     - `removeResult(resultId)` - Delete result
     - `getResultById(id)` - Fetch single result
     - `getResultsByTeam(teamName)` - Get all results for a team
     - `getResultsByCompetition(competition)` - Filter by competition
     - `getAllResults()` - Get all results sorted by date
     - `getRecentResults(limit)` - Get most recent results

3. **[commands/results.js](commands/results.js)**
   - Slash command handler for all results operations
   - Manages permissions
   - Creates rich embeds for responses
   - Provides subcommands: add, edit, remove, view, team

4. **[utils/embeds.js](utils/embeds.js)**
   - Result-specific embed builders:
     - `buildResultAddEmbed()` - Shows newly added result
     - `buildResultEditEmbed()` - Shows updated result
     - `buildResultDeleteEmbed()` - Shows removed result
     - `buildResultsListEmbed()` - Shows recent results list
     - `buildTeamResultsEmbed()` - Shows team-specific stats

5. **[services/index.js](services/index.js)**
   - Exports ResultsManager for use across the system

6. **[main.js](main.js)**
   - Initializes ResultsManager on client startup
   - Attaches to `client.resultsManager` for command access

## Dashboard Integration

The Results Centre is designed to sync with the dashboard system:

1. **Data Persistence** - All results are saved to `data/results.json` automatically
2. **Real-time Updates** - Changes are immediately reflected in storage
3. **Dashboard Ready** - The DashboardManager can access results via `client.resultsManager`

### Future Enhancement
To fully integrate with dashboard:
```javascript
// In DashboardManager.sync()
await client.resultsManager.syncResults();
```

## Usage Examples

### Example 1: Adding a World Cup Match
```
/results add 
  home_team: Brazil 
  away_team: Germany 
  home_score: 3 
  away_score: 0 
  competition: World Cup Final 
  stadium: Lusail Stadium 
  attendance: 80000
```

### Example 2: Viewing England's Results
```
/results team team_name: England
```

Returns: England's complete record with win/loss/draw stats, goal differential, and recent matches.

### Example 3: Correcting a Score
```
/results edit 
  result_id: result_1717632000000 
  home_score: 3 
  away_score: 1
```

## Error Handling

The system includes comprehensive error handling:

- ✅ Validates all input data
- ✅ Confirms result exists before editing/removing
- ✅ Permission checks prevent unauthorized access
- ✅ Graceful error messages for users
- ✅ Validation on initialization

## Permissions Model

```
┌─────────────────────────────────────┐
│     Role: RSA | Officials           │
│     Role: Bot Owner                 │
│     Role: Guild Owner               │
└─────────────────────────────────────┘
     ↓ Can perform ↓
  ✅ Add Results
  ✅ Edit Results
  ✅ Delete Results
  
┌─────────────────────────────────────┐
│     Everyone Else                   │
└─────────────────────────────────────┘
     ↓ Can perform ↓
  📖 View Results Only
```

## System Status

✅ **Implemented Features:**
- [x] Results Store (JsonStorage)
- [x] Results Manager (Business Logic)
- [x] Results Command (User Interface)
- [x] Embed Builders (Display)
- [x] Permission System
- [x] Historical Storage
- [x] Team Statistics
- [x] Client Integration

⏳ **Ready for:**
- Dashboard widget integration
- Results notifications/announcements
- Scheduled results sync
- Results API endpoints

## Troubleshooting

### "You do not have permission" Error
- Ensure you have the "RSA | Officials" role or are the Bot Owner
- Check role names are exactly "RSA | Officials" or "Bot Owner"

### Results not showing
- Verify `data/results.json` exists and is readable
- Check that ResultsManager initialized correctly in startup logs
- Ensure results were added with correct format

### EditResult not working
- Confirm the result ID is correct (check with `/results view`)
- Only `home_score`, `away_score`, and `notes` can be edited
- For other changes, remove and re-add the result

---

**Created:** 2026-06-06
**Version:** 1.0
**Status:** Ready for Production
