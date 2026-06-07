# Compliance Engine Documentation

## Overview

The Compliance Engine is an automated system that detects violations across RSA team management, staff assignments, rosters, and transfers. It provides comprehensive monitoring, warning generation, and resolution guidance.

## Key Features

✅ **Automatic Detection** - Continuously scans for 8 different violation types
✅ **Real-time Monitoring** - Background scans every 6 hours
✅ **Severity Levels** - Critical, High, Medium, Low priority warnings
✅ **Resolution Guides** - Built-in instructions for fixing violations
✅ **Feed System** - View and manage all violations in one place
✅ **Dashboard Integration** - Syncs with main dashboard for visibility

## Violation Types

### 🚨 Critical Violations

#### 1. **Illegal Signings** (`ILLEGAL_SIGNING`)
A player is rostered for a team without a valid transfer record.

**Symptoms:**
- Player appears on team roster
- No corresponding transfer in transfer history
- Transfer status not marked as completed

**Causes:**
- Manual roster entry without proper transfer
- Failed to record transfer before signing
- Data synchronization issue

**Resolution:**
1. Use `/sign` command to create proper transfer
2. Get manager authorization
3. Record full transfer details
4. Re-run compliance scan

---

#### 2. **Cup Tied Violations** (`CUP_TIED_VIOLATION`)
A player with the cup-tied role is still on an active team roster.

**Symptoms:**
- Player has cup-tied role
- Player still appears on team roster
- Player potentially eligible for team play

**Causes:**
- Failed to remove cup-tied player from roster
- Role assignment delayed
- Roster not updated after cup-tied designation

**Resolution:**
1. Use `/release` to remove player from roster
2. Or use `/sanction` if status changed
3. Update cup-tied role if player no longer tied
4. Re-run compliance scan

---

#### 3. **Duplicate Roster Entries** (`DUPLICATE_ROSTER_ENTRY`)
Same player appears multiple times in a single team's roster.

**Symptoms:**
- Player listed twice or more on same team
- Duplicate entries in roster data

**Causes:**
- Manual data entry error
- Failed roster sync
- Accidental duplicate addition

**Resolution:**
1. Identify the duplicate entry
2. Remove extra occurrence
3. Keep single, correct entry
4. Re-run compliance scan

---

#### 4. **Player on Multiple Teams** (`PLAYER_MULTIPLE_TEAMS`)
A single player is rostered for multiple teams simultaneously.

**Symptoms:**
- Player appears on 2+ team rosters
- Player has multiple team roles

**Causes:**
- Incomplete transfer process
- Failed to release from old team
- Simultaneous roster entries

**Resolution:**
1. Determine correct team assignment
2. Use `/release` to remove from incorrect teams
3. Process proper transfer if moving teams
4. Re-run compliance scan

---

### ⚠️ High Priority Violations

#### 5. **Duplicate Managers** (`DUPLICATE_MANAGER`)
Same person assigned as manager for multiple teams.

**Symptoms:**
- One manager ID appears for multiple teams
- Manager spread too thin

**Causes:**
- Oversight in staff assignment
- Temporary assignment not updated
- Role assignment error

**Resolution:**
1. Identify which team is primary
2. Use `/staffcentre manager remove` for secondary teams
3. Recruit new managers for other teams
4. Re-run compliance scan

---

#### 6. **Transfer Window Violations** (`TRANSFER_WINDOW_VIOLATION`)
Transfer was completed outside the transfer window.

**Symptoms:**
- Transfer completed when window was closed
- Date mismatch with window status

**Causes:**
- Retroactive transfer recording
- Window status change not applied
- Data consistency issue

**Resolution:**
1. Review transfer date and window status
2. Create correction transfer if needed
3. Document reason in notes
4. Re-run compliance scan

---

#### 7. **Roster Oversized** (`ROSTER_OVERSIZED`)
Team roster exceeds the maximum limit.

**Symptoms:**
- Roster count > team limit (usually 16)
- Excess players on roster

**Causes:**
- Added players without checking limit
- Release command failed
- Data synchronization issue

**Resolution:**
1. Review roster members
2. Use `/release` to remove excess players
3. Reduce to acceptable level
4. Re-run compliance scan

---

### 🔶 Medium Priority Violations

#### 8. **Duplicate Assistants** (`DUPLICATE_ASSISTANT`)
Same person assigned as assistant for multiple teams.

**Symptoms:**
- One assistant appears on multiple teams
- Assistants stretched across teams

**Causes:**
- Temporary assignment not updated
- Multiple teams sharing assistant
- Assignment error

**Resolution:**
1. Determine which teams need the assistant
2. Use `/staffcentre assistant remove` for extras
3. Recruit additional assistants if needed
4. Re-run compliance scan

---

### 🟡 Low Priority Violations

#### 9. **Missing Managers** (`MISSING_MANAGER`)
Team has no manager assigned.

**Symptoms:**
- Team managerDiscordId is empty or '0'
- No active manager for team

**Impact:**
- Team has no leadership
- Cannot process roster changes properly
- Compliance issue

**Resolution:**
1. Recruit a qualified manager
2. Use `/staffcentre manager assign`
3. Verify manager permissions
4. Re-run compliance scan

---

#### 10. **Missing Assistants** (`MISSING_ASSISTANTS`)
Team has no assistant coaches assigned.

**Symptoms:**
- Team assistantsDiscordIds array is empty
- No assistant support

**Impact:**
- No backup leadership
- Reduced team management capability

**Resolution:**
1. Recruit assistant coach(es)
2. Use `/staffcentre assistant assign`
3. Assign at least one assistant
4. Re-run compliance scan

---

## Commands

### `/compliance scan`
Run a full compliance scan across all teams, transfers, and staff assignments.

**Output:**
- Summary of violations found
- Categorized by severity
- Type breakdown

**When to use:**
- After major roster changes
- After transfer window closes
- During regular audits
- When violations suspected

---

### `/compliance summary`
View the compliance summary and statistics without running a scan.

**Shows:**
- Total violations count
- Violations by severity (Critical/High/Medium/Low)
- Active warnings count
- Breakdown by violation type
- Last scan timestamp

**Usage:**
```
/compliance summary
```

---

### `/compliance feed [page]`
View the compliance feed with detailed violation information.

**Parameters:**
- `page` (optional) - Page number, default 0

**Features:**
- Up to 5 violations per page
- Detailed violation information
- Page navigation

**Usage:**
```
/compliance feed page:0
```

---

### `/compliance violations [filter]`
View violations filtered by type or severity.

**Filter Options:**
- **Severity:** Critical, High, Medium, Low
- **Type:** Illegal Signings, Duplicate Managers, Duplicate Assistants, Cup Tied Violations, Missing Managers, Roster Violations

**Usage:**
```
/compliance violations filter:CRITICAL
/compliance violations filter:ILLEGAL_SIGNING
```

---

### `/compliance resolve <warning_id>`
Mark a warning as resolved.

**Parameters:**
- `warning_id` (required) - ID of warning to resolve

**Note:** This marks the warning as resolved but doesn't fix the underlying issue. You must fix the violation first.

**Usage:**
```
/compliance resolve warning_id:warning_1717632000000_abc123
```

---

### `/compliance guide <violation_type>`
Get step-by-step resolution guide for a violation type.

**Violation Types:**
- Illegal Signings
- Duplicate Managers
- Duplicate Assistants
- Cup Tied Violations
- Transfer Window Violations
- Missing Managers
- Missing Assistants
- Oversized Rosters
- Duplicate Roster Entries
- Players on Multiple Teams

**Usage:**
```
/compliance guide violation_type:"Illegal Signings"
```

---

### `/compliance clear`
Clear all warnings older than 7 days.

**Effect:**
- Removes resolved and old warnings
- Keeps recent warnings
- Keeps unresolved critical violations

**Usage:**
```
/compliance clear
```

---

## Data Structure

### Violation Object
```json
{
  "type": "ILLEGAL_SIGNING",
  "severity": "CRITICAL",
  "message": "Player <@123456> on Team X has no valid transfer",
  "timestamp": "2026-06-06T12:34:56.000Z",
  
  // Type-specific fields vary
  "playerId": "123456",
  "playerName": "PlayerName",
  "team": "Team X"
}
```

### Warning Object
```json
{
  "id": "warning_1717632000000_abc123",
  "type": "ILLEGAL_SIGNING",
  "severity": "CRITICAL",
  "message": "...",
  "timestamp": "2026-06-06T12:34:56.000Z",
  "status": "ACTIVE",
  "resolvedAt": null
}
```

## Auto-Detection

### Periodic Scanning
- **Frequency:** Every 6 hours
- **Scope:** All teams, transfers, staff
- **Alerts:** Critical violations trigger feed notification
- **Channel:** compliance-feed, mod-logs, or admin-logs

### Event-Triggered Scanning
The system checks compliance on:
- Sign command completion
- Release command completion
- Staff assignment changes
- Roster modifications
- Transfer window state changes

## Severity Levels

| Severity | Color | Emoji | Impact | Action Required |
|----------|-------|-------|--------|-----------------|
| CRITICAL | 🔴 Red | 🚨 | Immediate game impact | Fix immediately |
| HIGH | 🟠 Orange | ⚠️ | Can affect matches | Fix within 24 hours |
| MEDIUM | 🟡 Yellow | ⚡ | Minor impact | Fix within 72 hours |
| LOW | 🟢 Green | 📢 | Administrative only | Fix when convenient |

## Dashboard Integration

The Compliance Engine syncs with the dashboard:

1. **Violation Summary Widget** - Shows violation counts by severity
2. **Real-time Alerts** - Critical violations appear immediately
3. **Compliance Feed Channel** - Posts to designated channel
4. **Historical Tracking** - Maintains violation history
5. **Resolution Status** - Tracks warning status changes

### Dashboard Data Access
```javascript
const summary = client.complianceEngine.getSummary();
const violations = client.complianceEngine.violations;
const warnings = client.complianceEngine.getActiveWarnings();
```

## Files & Implementation

### Core Components

1. **[storage/ComplianceStore.js](storage/ComplianceStore.js)**
   - Persistent storage for violations and warnings
   - Default structure with empty arrays

2. **[services/ComplianceEngine.js](services/ComplianceEngine.js)**
   - Main detection and analysis logic
   - 8 violation detection methods
   - Scan and reporting functionality
   - Getter/resolver methods

3. **[commands/compliance.js](commands/compliance.js)**
   - Slash command with 7 subcommands
   - Permission checking
   - User-facing interface

4. **[utils/compliance.js](utils/compliance.js)**
   - Embed builders for displays
   - Color and emoji mapping
   - Resolution guides

5. **[events/complianceAutoScan.js](events/complianceAutoScan.js)**
   - Periodic scanning event
   - Auto-alerts for critical violations
   - 6-hour scan interval

6. **[data/compliance.json](data/compliance.json)**
   - Persistent violation and warning storage

## Usage Examples

### Example 1: Run Weekly Compliance Audit
```
/compliance scan
```
Result: Full system scan with complete report

### Example 2: Check for Illegal Signings
```
/compliance violations filter:"Illegal Signings"
```
Result: List of all players without valid transfers

### Example 3: Fix Duplicate Manager
```
/compliance guide violation_type:"Duplicate Managers"
```
Result: Step-by-step resolution instructions

### Example 4: View Current Status
```
/compliance summary
```
Result: Quick overview of system compliance state

## Best Practices

### Regular Maintenance
✅ Run `/compliance scan` weekly
✅ Check `/compliance summary` before major events
✅ Clear old warnings with `/compliance clear` monthly
✅ Review resolution guides when violations found

### Incident Response
✅ Critical violations get immediate attention
✅ Use resolution guides for systematic fixes
✅ Document reasons for unavoidable violations
✅ Re-scan after making changes

### Prevention
✅ Always use proper `/sign` command for signings
✅ Use `/release` when removing players
✅ Keep manager/assistant assignments current
✅ Monitor roster sizes during transfer windows

## Troubleshooting

### Scan Takes Too Long
- Check if teams/transfers data is very large
- Scan may take 5-10 seconds for large datasets
- Results are cached for faster access

### False Positives
- Some violations may be intentional (temporary assignments)
- Use `/compliance resolve` to acknowledge
- Document reason in team notes

### Missing Violations
- Run `/compliance scan` to refresh data
- Ensure all managers/staff properly assigned
- Check data consistency in teams.json

## Future Enhancements

Planned features:
- Automated resolution of certain violations
- Scheduled compliance reports
- Violation history timeline
- Predictive compliance alerts
- Integration with penalty system

---

**Created:** 2026-06-06
**Version:** 1.0
**Status:** Production Ready
