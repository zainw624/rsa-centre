const http = require('http');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const { readdirSync } = require('fs');
const path = require('path');
const { getProcessedLogoAttachment } = require('./utils/logo');
const ResultsManager = require('./services/ResultsManager');
const ComplianceEngine = require('./services/ComplianceEngine');
const ManagersDashboard = require('./services/ManagersDashboard');
const OperationsCenter = require('./services/OperationsCenter');
const TransferManager = require('./services/TransferManager');
const FixtureManager = require('./services/FixtureManager');
const LeagueMonitor = require('./services/LeagueMonitor');

dotenv.config();

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ Missing DISCORD_TOKEN in .env');
  process.exit(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEAM REGISTRY & DATA MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TEAMS_FILE = path.join(__dirname, 'data', 'teams.json');

class TeamRegistry {
  constructor() {
    this.teams = [];
  }

  async loadTeams() {
    try {
      const data = await fs.readFile(TEAMS_FILE, 'utf8');
      this.teams = JSON.parse(data).teams;
      console.log(`✅ Loaded ${this.teams.length} teams from teams.json`);
    } catch (error) {
      console.error('❌ Failed to load teams.json:', error.message);
      throw error;
    }
  }

  async saveTeams() {
    try {
      await fs.writeFile(TEAMS_FILE, JSON.stringify({ teams: this.teams }, null, 2), 'utf8');
    } catch (error) {
      console.error('❌ Failed to save teams.json:', error.message);
      throw error;
    }
  }

  getTeamByName(teamName) {
    return this.teams.find(t => t.teamName === teamName);
  }

  getTeamByCode(teamCode) {
    return this.teams.find(t => t.teamCode === teamCode);
  }

  getAllTeamNames() {
    return this.teams.map(t => ({ name: t.teamName, value: t.teamName }));
  }

  async addPlayerToRoster(teamName, playerId, playerName) {
    const team = this.getTeamByName(teamName);
    if (!team) throw new Error(`Team ${teamName} not found`);

    if (team.rosterPlayers.length >= team.rosterLimit) {
      throw new Error(`${teamName} roster is full (${team.rosterLimit}/16)`);
    }

    const playerExists = team.rosterPlayers.some(p => p.playerId === playerId);
    if (playerExists) throw new Error(`Player already on ${teamName} roster`);

    team.rosterPlayers.push({ playerId, playerName, joinedAt: new Date().toISOString() });
    await this.saveTeams();
    return team;
  }

  async removePlayerFromRoster(teamName, playerId) {
    const team = this.getTeamByName(teamName);
    if (!team) throw new Error(`Team ${teamName} not found`);

    const playerIndex = team.rosterPlayers.findIndex(p => p.playerId === playerId);
    if (playerIndex === -1) throw new Error(`Player not found on ${teamName} roster`);

    team.rosterPlayers.splice(playerIndex, 1);
    await this.saveTeams();
    return team;
  }
}

const registry = new TeamRegistry();
const commandsPath = path.join(__dirname, 'commands');
let commandModules = [];

try {
  const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  commandModules = commandFiles.map((file) => require(path.join(commandsPath, file)));
} catch (error) {
  console.warn('⚠️ Unable to load command modules:', error.message);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLASH COMMANDS BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const buildCommands = () => {
  const commandData = commandModules
    .filter((cmd) => cmd && cmd.data && typeof cmd.data.toJSON === 'function')
    .map((cmd) => cmd.data.toJSON());

  return commandData;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEAM ROLE SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function setupTeamRoles(guild) {
  let changed = false;
  for (const team of registry.teams) {
    let teamRole = null;

    if (team.roleId) {
      teamRole = guild.roles.cache.get(team.roleId);
    }

    if (!teamRole) {
      teamRole = guild.roles.cache.find((role) => role.name === team.teamName || role.name === team.teamCode);
    }

    if (!teamRole) {
      try {
        teamRole = await guild.roles.create({
          name: team.teamName,
          color: '#1f1f1f',
          reason: `[RSA] Auto-created team role for ${team.teamName}`,
        });
        console.log(`✅ Created team role: ${team.teamName} (${teamRole.id})`);
      } catch (error) {
        console.error(`❌ Failed to create role for ${team.teamName}: ${error.message}`);
        continue;
      }
    }

    if (team.roleId !== teamRole.id) {
      team.roleId = teamRole.id;
      changed = true;
    }
  }

  if (changed) {
    await registry.saveTeams();
    console.log('✅ Team roles configuration updated');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISCORD CLIENT SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
for (const command of commandModules) {
  if (command && command.data && command.data.name) {
    client.commands.set(command.data.name, command);
  }
}

let startupHandled = false;

async function handleClientReady() {
  if (startupHandled) return;
  startupHandled = true;

  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    await registry.loadTeams();

    // Initialize ResultsManager
    client.resultsManager = new ResultsManager();
    await client.resultsManager.initialize();
    const resultsErrors = await client.resultsManager.validate();
    if (resultsErrors.length > 0) {
      console.warn('⚠️ Results validation errors:', resultsErrors);
    } else {
      console.log('✅ Results Manager initialized');
    }

    // Initialize ComplianceEngine
    client.complianceEngine = new ComplianceEngine();
    await client.complianceEngine.initialize();
    console.log('✅ Compliance Engine initialized');

    // Initialize ManagersDashboard
    client.managersDashboard = new ManagersDashboard();
    await client.managersDashboard.initialize();
    console.log('✅ Managers Dashboard initialized');

    // Initialize TransferManager
    client.transferManager = new TransferManager();
    await client.transferManager.initialize();
    const transferErrors = await client.transferManager.validateTransfers();
    if (transferErrors.length > 0) {
      console.warn('⚠️ Transfer validation errors:', transferErrors);
    } else {
      console.log('✅ Transfer Manager initialized');
    }

    // Initialize FixtureManager
    client.fixtureManager = new FixtureManager();
    await client.fixtureManager.initialize();
    const fixtureErrors = await client.fixtureManager.validateFixtures();
    if (fixtureErrors.length > 0) {
      console.warn('⚠️ Fixture validation errors:', fixtureErrors);
    } else {
      console.log('✅ Fixture Manager initialized');
    }

    // Initialize OperationsCenter
    client.operationsCenter = new OperationsCenter();
    await client.operationsCenter.initialize();
    console.log('✅ Operations Centre initialized');

    await client.guilds.fetch();

    // Initialize LeagueMonitor before appReady-dependent events run
    client.leagueMonitor = new LeagueMonitor(client);
    await client.leagueMonitor.initialize();
    console.log('✅ LeagueMonitor initialized');

    for (const guild of client.guilds.cache.values()) {
      await setupTeamRoles(guild).catch((err) => {
        console.warn(`⚠️ Failed to setup team roles for ${guild.id}: ${err.message}`);
      });
    }

    const commands = buildCommands();
    await client.application.commands.set(commands);
    console.log('✅ Global slash commands registered');

    for (const guild of client.guilds.cache.values()) {
      await guild.commands.set(commands).catch((err) => {
        console.warn(`⚠️ Failed to register guild commands for ${guild.id}: ${err.message}`);
      });
    }
    console.log('✅ Guild slash commands registered');

    client.emit('appReady');
    console.log('✅ App ready event emitted');
  } catch (error) {
    console.error('❌ Startup error:', error);
  }
}

client.once('ready', handleClientReady);
client.once('clientReady', handleClientReady);

// Load event handlers
const eventsPath = path.join(__dirname, 'events');
function registerBotEvent(event) {
  if (!event) return;
  if (Array.isArray(event)) {
    for (const subEvent of event) {
      registerBotEvent(subEvent);
    }
    return;
  }

  if (!event.name || typeof event.execute !== 'function') {
    return;
  }

  const listener = (...args) => event.execute(client, ...args);
  if (event.once) {
    client.once(event.name, listener);
  } else {
    client.on(event.name, listener);
  }
}

try {
  const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    registerBotEvent(event);
  }
  console.log('✅ Event modules loaded');
} catch (error) {
  console.warn('⚠️ Unable to load event modules:', error.message);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROSTER COMMAND HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleRosterCommand(interaction) {
  await interaction.deferReply();

  const teamName = interaction.options.getString('team');
  const team = registry.getTeamByName(teamName);

  if (!team) {
    await interaction.editReply({
      content: `❌ Team "${teamName}" not found.`,
    });
    return;
  }

  let logoAttachment = null;
  try {
    logoAttachment = await getProcessedLogoAttachment(team);
  } catch (err) {
    console.warn(`⚠️ Logo not found or could not be processed for ${team.teamName}: ${err.message}`);
  }

  // Build roster embed
  const embed = new EmbedBuilder()
    .setTitle(`🏆 ${team.teamName} Roster`)
    .setColor('#1f1f1f')
    .addFields(
      {
        name: '👤 Coach',
        value: team.coachDiscordId !== '0' ? `<@${team.coachDiscordId}>` : 'No coach assigned',
        inline: false,
      },
      {
        name: '📊 Squad Size',
        value: `${team.rosterPlayers.length}/${team.rosterLimit}`,
        inline: true,
      },
      {
        name: '🏅 Team Code',
        value: team.teamCode,
        inline: true,
      }
    );

  // Add players field
  if (team.rosterPlayers.length > 0) {
    const playersList = team.rosterPlayers
      .map((p, i) => `${i + 1}. ${p.playerName} (ID: ${p.playerId})`)
      .join('\n');

    embed.addFields({
      name: '📋 Players',
      value: playersList,
      inline: false,
    });
  } else {
    embed.addFields({
      name: '📋 Players',
      value: 'No players in roster.',
      inline: false,
    });
  }

  embed.setFooter({ text: 'RSA | Roblox Soccer Association' });
  embed.setTimestamp();

  if (logoAttachment) {
    embed.setThumbnail(`attachment://${logoAttachment.name}`);
    await interaction.editReply({
      embeds: [embed],
      files: [logoAttachment],
    });
  } else {
    await interaction.editReply({
      embeds: [embed],
    });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleCommandError(interaction, error) {
  const errorEmbed = new EmbedBuilder()
    .setTitle('❌ Error')
    .setDescription(error.message || 'An unexpected error occurred.')
    .setColor('#ff0000')
    .setFooter({ text: 'RSA | Roblox Soccer Association' });

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed], content: '' });
    } else {
      await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  } catch (replyError) {
    console.error('Failed to send error message:', replyError);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP KEEP-ALIVE / HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`🌐 HTTP server listening on port ${PORT}`);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

client.login(token);
