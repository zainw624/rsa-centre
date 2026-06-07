
# 🚀 Dashboard Deployment Checklist

## Pre-Deployment

- [ ] Bot has `GatewayIntentBits.Guilds` intent
- [ ] Bot has `GatewayIntentBits.GuildMembers` intent
- [ ] Bot has `GatewayIntentBits.GuildRoles` intent
- [ ] Bot has permission to create channels
- [ ] Bot has permission to send messages
- [ ] Bot has permission to edit messages
- [ ] Bot has permission to create embeds

## Role Setup

Ensure these roles exist in your Discord server:

**Required Manager Roles:**
- [ ] "RSA | Managers" role exists
- [ ] "RSA | Assistant Managers" role exists

**Required Team Roles (all 16):**
- [ ] Belgium
- [ ] Brazil
- [ ] Croatia
- [ ] England
- [ ] France
- [ ] Germany
- [ ] Ghana
- [ ] Japan
- [ ] Morocco
- [ ] Netherlands
- [ ] Norway
- [ ] Senegal
- [ ] Spain
- [ ] Sweden
- [ ] Türkiye
- [ ] USA

## Configuration

- [ ] `data/settings.json` updated with correct `botOwnerId`
- [ ] `data/teams.json` contains all 16 teams
- [ ] All team `roleId` values populated (auto-done on bot startup)
- [ ] Team logo assets exist in `assets/` (or will fall back to RSA logo)

## Deployment

1. **Start the bot**
   ```bash
   node main.js
   ```

2. **Create the dashboard**
   ```
   /managers
   ```

3. **Verify dashboard**
   - Check `#rsa-management-dashboard` channel is created
   - Dashboard message displays with all 16 teams
   - Status indicators show correctly
   - Activity feed begins populating

## First-Time Adjustments

After dashboard is created:

1. Assign manager roles to managers:
   ```
   @Manager should have: RSA | Managers + Spain
   ```

2. Assign assistant manager roles:
   ```
   @Assistant should have: RSA | Assistant Managers + Spain
   ```

3. Dashboard should auto-update within 5 seconds

## Verification Tests

Run these tests after deployment:

### Test 1: Manager Assignment
1. Add "RSA | Managers" role to test user
2. Add "Spain" team role to test user
3. Run `/managers` or wait for auto-update (5s)
4. Verify dashboard shows "🟢 Spain" with manager assigned

### Test 2: Assistant Assignment
1. Add "RSA | Assistant Managers" role to same user
2. Wait for auto-update (5s)
3. Dashboard should show "🟢 Fully Staffed"

### Test 3: Pagination
1. Click "Next ▶" button
2. Dashboard should show Page 2 teams
3. Click "◀ Previous" button
4. Dashboard should show Page 1 teams again

### Test 4: Refresh Button
1. Click "🔄 Refresh" button
2. Dashboard should rescan and update

### Test 5: Auto-Update
1. Remove manager role from test user
2. Wait 5 seconds
3. Dashboard should auto-update to show "🟡 Assistant Needed"

### Test 6: Activity Feed
1. Perform several role changes
2. Dashboard activity section should populate
3. Timestamps should show recent times

### Test 7: Conflict Detection
1. Add second user with "RSA | Managers" + Spain
2. Dashboard should show "🟠 Multiple Managers Detected"
3. Console should log conflict warning
4. Activity feed should record conflict event

### Test 8: Message Recovery
1. Delete the dashboard message
2. Wait 5+ seconds
3. Bot should recreate message in channel
4. Activity feed should show "Dashboard Recreated"

## Troubleshooting

If dashboard doesn't appear:
- [ ] Check bot console for errors
- [ ] Verify bot has channel creation permissions
- [ ] Verify all role names match exactly
- [ ] Check `data/dashboard.json` file was created

If managers not detected:
- [ ] Verify role names are exactly "RSA | Managers" and "RSA | Assistant Managers"
- [ ] Verify users have both manager role AND team role
- [ ] Run `/managers` command to force rescan
- [ ] Check console for role lookup errors

If pagination not working:
- [ ] Verify bot has permission to edit messages
- [ ] Check if buttons are being clicked
- [ ] Check console for button handler errors

## Long-Term Maintenance

**Daily:**
- Dashboard auto-maintains itself
- No manual updates needed
- All changes tracked automatically

**Weekly:**
- Review activity log in console
- Check for unresolved conflicts
- Verify all 16 teams have managers

**Monthly:**
- Review leadership-activity.json for patterns
- Archive old activity logs if needed

## Performance Metrics

Expected performance:
- Dashboard creation: < 2 seconds
- Role change detection: 5-10 seconds (batched)
- Message update: < 1 second
- Activity log insert: < 100ms

## Files to Monitor

```
data/
├── dashboard.json (dashboard configuration)
├── leadership-activity.json (activity log)
├── teams.json (team definitions with roleIds)
└── settings.json (role names and channel IDs)
```

## Success Indicators

✅ Dashboard system is working correctly when:
- [ ] `/managers` command creates dashboard message
- [ ] Dashboard displays all 16 teams
- [ ] Manager/assistant assignments show correctly
- [ ] Pagination buttons work
- [ ] Dashboard auto-updates on role changes
- [ ] Activity feed populates with events
- [ ] Conflicts are detected and logged
- [ ] Message auto-recreates if deleted

---

**Status:** ✅ Ready for Production Deployment
