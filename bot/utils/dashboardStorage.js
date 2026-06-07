const fs = require('fs').promises;
const path = require('path');

const DASHBOARD_PATH = path.join(__dirname, '..', 'data', 'dashboard.json');
const ACTIVITY_LOG_PATH = path.join(__dirname, '..', 'data', 'leadership-activity.json');

const DEFAULT_DASHBOARD = {
  guildId: null,
  channelId: null,
  messageId: null,
  currentPage: 0,
  createdAt: null,
  lastUpdated: null,
};

const DEFAULT_ACTIVITY = {
  events: [],
};

/**
 * Ensure file exists with default content
 */
async function ensureFile(filePath, defaultContent) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
  }
}

/**
 * Load dashboard settings
 */
async function loadDashboard() {
  try {
    await ensureFile(DASHBOARD_PATH, DEFAULT_DASHBOARD);
    const raw = await fs.readFile(DASHBOARD_PATH, 'utf8');
    const parsed = JSON.parse(raw || JSON.stringify(DEFAULT_DASHBOARD));
    return parsed || DEFAULT_DASHBOARD;
  } catch (error) {
    console.error('Error loading dashboard settings:', error);
    return DEFAULT_DASHBOARD;
  }
}

/**
 * Save dashboard settings
 */
async function saveDashboard(dashboardData) {
  try {
    await fs.writeFile(DASHBOARD_PATH, JSON.stringify(dashboardData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving dashboard settings:', error);
  }
}

/**
 * Load activity log
 */
async function loadActivityLog() {
  try {
    await ensureFile(ACTIVITY_LOG_PATH, DEFAULT_ACTIVITY);
    const raw = await fs.readFile(ACTIVITY_LOG_PATH, 'utf8');
    const parsed = JSON.parse(raw || JSON.stringify(DEFAULT_ACTIVITY));
    return parsed || DEFAULT_ACTIVITY;
  } catch (error) {
    console.error('Error loading activity log:', error);
    return DEFAULT_ACTIVITY;
  }
}

/**
 * Add event to activity log
 */
async function addActivityEvent(event) {
  try {
    const log = await loadActivityLog();
    const eventWithTimestamp = {
      ...event,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    };

    log.events.unshift(eventWithTimestamp);
    // Keep only last 20 events
    log.events = log.events.slice(0, 20);

    await fs.writeFile(ACTIVITY_LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
    return eventWithTimestamp;
  } catch (error) {
    console.error('Error adding activity event:', error);
  }
}

/**
 * Get formatted activity events
 */async function getActivityFeed(count = 10) {
  try {
    const log = await loadActivityLog();
    return log.events.slice(0, count).map((event) => {
      const time = new Date(event.timestamp);
      const now = new Date();
      const diffMinutes = Math.floor((now - time) / (1000 * 60));

      let timeAgo = `${diffMinutes}m ago`;
      if (diffMinutes < 1) timeAgo = 'just now';
      else if (diffMinutes >= 60) timeAgo = `${Math.floor(diffMinutes / 60)}h ago`;

      return `${event.emoji} ${event.text}\n_${timeAgo}_`;
    });
  } catch (error) {
    console.error('Error getting activity feed:', error);
    return [];
  }
}

module.exports = {
  loadDashboard,
  saveDashboard,
  loadActivityLog,
  addActivityEvent,
  getActivityFeed,
};
