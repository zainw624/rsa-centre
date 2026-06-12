const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { memberHasRoleNames } = require('../utils/permissions');
const { loadSettings } = require('../utils/settings');
const { loadTeams } = require('../utils/teams');
const { getProcessedLogoAttachment } = require('../utils/logo');
const { addFixture, parseZonedKickoff, getUpcomingFixtures } = require('../utils/fixtures');
const { addActivityEvent } = require('../utils/dashboardStorage');
const { scheduleDashboardUpdate } = require('../events/dashboardAutoUpdate');
const { LEAGUE_AND_ADMIN, BOT_OWNER_ROLE } = require('../utils/hierarchy');

// Team choices are built from the team list at load time so /announcefix shows a
// dropdown of selectable teams. Discord allows up to 25 choices per option.
const teamsData = require('../data/teams.json');
const TEAM_CHOICES = (teamsData.teams || [])
  .slice(0, 25)
  .map((team) => ({ name: team.teamName, value: team.teamId }));

const GROUP_CHOICES = [
  { name: 'Group A', value: 'A' },
  { name: 'Group B', value: 'B' },
  { name: 'Group C', value: 'C' },
  { name: 'Group D', value: 'D' },
];

// Friendly label → IANA time zone identifier. Used to convert the staff
// member's local kickoff time into the correct UTC instant.
const TIMEZONE_CHOICES = [
  { name: 'UTC', value: 'UTC' },
  { name: 'UK — London (GMT/BST)', value: 'Europe/London' },
  { name: 'Portugal — Lisbon', value: 'Europe/Lisbon' },
  { name: 'Central Europe — Paris/Madrid/Berlin', value: 'Europe/Paris' },
  { name: 'Eastern Europe — Athens', value: 'Europe/Athens' },
  { name: 'Türkiye — Istanbul', value: 'Europe/Istanbul' },
  { name: 'Moscow', value: 'Europe/Moscow' },
  { name: 'US Eastern — New York', value: 'America/New_York' },
  { name: 'US Central — Chicago', value: 'America/Chicago' },
  { name: 'US Mountain — Denver', value: 'America/Denver' },
  { name: 'US Pacific — Los Angeles', value: 'America/Los_Angeles' },
  { name: 'Brazil — São Paulo', value: 'America/Sao_Paulo' },
  { name: 'West Africa — Lagos/Accra', value: 'Africa/Lagos' },
  { name: 'South Africa — Johannesburg', value: 'Africa/Johannesburg' },
  { name: 'UAE — Dubai', value: 'Asia/Dubai' },
  { name: 'India — Kolkata (IST)', value: 'Asia/Kolkata' },
  { name: 'Japan — Tokyo', value: 'Asia/Tokyo' },
  { name: 'Australia — Sydney', value: 'Australia/Sydney' },
];

const TIMEZONE_LABELS = Object.fromEntries(TIMEZONE_CHOICES.map((tz) => [tz.value, tz.name]));

const FIXTURE_ANNOUNCE_ROLES = [...LEAGUE_AND_ADMIN, BOT_OWNER_ROLE];
const DEFAULT_FIXTURE_CHANNEL_ID = '1509978110647336990';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcefix')
    .setDescription('Post a fixture announcement to the RSA Fixtures Centre')
    .addStringOption((option) =>
      option
        .setName('home_team')
        .setDescription('Home team')
        .setRequired(true)
        .addChoices(...TEAM_CHOICES)
    )
    .addStringOption((option) =>
      option
        .setName('away_team')
        .setDescription('Away team')
        .setRequired(true)
        .addChoices(...TEAM_CHOICES)
    )
    .addStringOption((option) =>
      option
        .setName('competition')
        .setDescription('Competition or tournament name')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('date')
        .setDescription('Match date (YYYY-MM-DD, e.g. 2026-06-21)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('time')
        .setDescription('Kickoff time in 24h format (HH:mm, e.g. 18:30)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('group')
        .setDescription('Group this fixture belongs to')
        .setRequired(false)
        .addChoices(...GROUP_CHOICES)
    )
    .addStringOption((option) =>
      option
        .setName('timezone')
        .setDescription('Time zone for the kickoff time (defaults to UTC)')
        .setRequired(false)
        .addChoices(...TIMEZONE_CHOICES)
    )
    .addStringOption((option) =>
      option.setName('venue').setDescription('Fixture venue or stadium').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('notes').setDescription('Optional fixture notes').setRequired(false)
    ),

  async execute(interaction) {
    const settings = await loadSettings();
    const fixturesChannelId = settings.fixturesAnnouncementChannelId || DEFAULT_FIXTURE_CHANNEL_ID;

    if (!memberHasRoleNames(interaction.member, FIXTURE_ANNOUNCE_ROLES)) {
      await interaction.reply({ content: '❌ You do not have permission to use /announcefix.', flags: 64 });
      return;
    }

    const homeInput = interaction.options.getString('home_team');
    const awayInput = interaction.options.getString('away_team');
    const dateInput = interaction.options.getString('date').trim();
    const timeInput = interaction.options.getString('time').trim();
    const competition = interaction.options.getString('competition').trim();
    const group = interaction.options.getString('group') || null;
    const timezone = interaction.options.getString('timezone') || 'UTC';
    const venue = interaction.options.getString('venue')?.trim() || 'TBD';
    const notes = interaction.options.getString('notes')?.trim() || '';

    const teams = await loadTeams();
    const matchTeam = (value) =>
      teams.find(
        (team) =>
          team.teamId === value ||
          team.teamName.toLowerCase() === value.toLowerCase() ||
          team.teamCode.toLowerCase() === value.toLowerCase()
      );
    const homeTeam = matchTeam(homeInput);
    const awayTeam = matchTeam(awayInput);

    if (!homeTeam || !awayTeam) {
      await interaction.reply({ content: '❌ One or both teams could not be found. Pick teams from the dropdown.', flags: 64 });
      return;
    }

    if (homeTeam.teamId === awayTeam.teamId) {
      await interaction.reply({ content: '❌ Home and away teams must be different.', flags: 64 });
      return;
    }

    const kickoffDate = parseZonedKickoff(dateInput, timeInput, timezone);
    if (!kickoffDate) {
      await interaction.reply({ content: '❌ Date or time could not be read. Use date `YYYY-MM-DD` (e.g. `2026-06-21`) and time `HH:mm` in 24h (e.g. `18:30`).', flags: 64 });
      return;
    }

    if (kickoffDate.getTime() <= Date.now()) {
      await interaction.reply({ content: '❌ Kickoff time must be in the future.', flags: 64 });
      return;
    }

    const announcementChannel = await interaction.client.channels.fetch(fixturesChannelId).catch(() => null);
    if (!announcementChannel || !announcementChannel.isTextBased()) {
      await interaction.reply({ content: '❌ The Fixtures Centre channel is unavailable.', flags: 64 });
      return;
    }

    let homeLogoAttachment = null;
    let awayLogoAttachment = null;
    try {
      homeLogoAttachment = await getProcessedLogoAttachment(homeTeam);
    } catch {
      homeLogoAttachment = null;
    }
    try {
      awayLogoAttachment = await getProcessedLogoAttachment(awayTeam);
    } catch {
      awayLogoAttachment = null;
    }

    let fixture;
    try {
      fixture = await addFixture({
        homeTeam: homeTeam.teamName,
        awayTeam: awayTeam.teamName,
        homeTeamCode: homeTeam.teamCode,
        awayTeamCode: awayTeam.teamCode,
        kickoff: kickoffDate.toISOString(),
        competition,
        group,
        venue,
        notes,
        creatorId: interaction.user.id,
        creatorName: interaction.user.tag,
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ ${error.message || 'This fixture could not be saved.'}`,
        flags: 64,
      });
      return;
    }

    // Sync to the website so the fixture appears on the schedule/world cup pages.
    // Non-fatal: a sync failure must not block the Discord announcement.
    try {
      const websiteUrl = process.env.WEBSITE_URL;
      const syncSecret = process.env.ROLES_SYNC_SECRET;
      if (websiteUrl && syncSecret) {
        const syncResponse = await fetch(`${websiteUrl}/api/bot/fixture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-secret': syncSecret,
          },
          body: JSON.stringify({
            homeTeam: homeTeam.teamName,
            awayTeam: awayTeam.teamName,
            homeTeamCode: homeTeam.teamCode,
            awayTeamCode: awayTeam.teamCode,
            kickoff: kickoffDate.toISOString(),
            competition,
            group,
            venue,
            notes,
            creatorId: interaction.user.id,
            creatorName: interaction.user.tag,
          }),
        });
        if (!syncResponse.ok) {
          const errorData = await syncResponse.json().catch(() => ({}));
          console.error('Fixture website sync failed:', errorData.error || syncResponse.status);
        }
      } else {
        console.warn('Fixture website sync skipped: WEBSITE_URL or ROLES_SYNC_SECRET not configured.');
      }
    } catch (syncError) {
      console.error('Fixture website sync failed:', syncError);
    }

    const kickoffUnix = Math.floor(kickoffDate.getTime() / 1000);
    const tzLabel = TIMEZONE_LABELS[timezone] || timezone;

    const fixtureEmbed = new EmbedBuilder()
      .setTitle(`📅 Fixture Announcement: ${homeTeam.teamName} vs ${awayTeam.teamName}`)
      .setDescription(group ? `**${competition}** · Group ${group}` : `**${competition}**`)
      .setColor('#00B37E')
      .addFields(
        { name: 'Home', value: homeTeam.teamName, inline: true },
        { name: 'Away', value: awayTeam.teamName, inline: true },
        { name: 'Group', value: group ? `Group ${group}` : 'N/A', inline: true },
        { name: 'Kickoff', value: `<t:${kickoffUnix}:F>`, inline: false },
        { name: 'Entered as', value: `${dateInput} ${timeInput} (${tzLabel})`, inline: false },
        { name: 'Venue', value: venue, inline: true },
        { name: 'Status', value: 'Scheduled', inline: true },
        { name: 'Notes', value: notes || 'None', inline: false }
      )
      .setFooter({ text: 'RSA Fixtures Centre' })
      .setTimestamp();

    if (homeLogoAttachment) {
      fixtureEmbed.setAuthor({ name: `${homeTeam.teamName}`, iconURL: `attachment://${homeLogoAttachment.name}` });
    }
    if (awayLogoAttachment) {
      fixtureEmbed.setThumbnail(`attachment://${awayLogoAttachment.name}`);
    }

    const attachments = [];
    if (homeLogoAttachment) attachments.push(homeLogoAttachment);
    if (awayLogoAttachment && awayLogoAttachment.name !== homeLogoAttachment?.name) attachments.push(awayLogoAttachment);

    try {
      await announcementChannel.send({ embeds: [fixtureEmbed], files: attachments });
    } catch (error) {
      console.error('Failed to post fixture announcement:', error);
      await interaction.reply({ content: '❌ Unable to post the fixture announcement at this time.', flags: 64 });
      return;
    }

    await addActivityEvent({
      emoji: '📌',
      text: `Fixture announced: ${homeTeam.teamName} vs ${awayTeam.teamName}`,
      type: 'fixtureAnnounced',
      fixtureId: fixture.id,
      guildId: interaction.guild.id,
      staffId: interaction.user.id,
    }).catch(() => null);

    await scheduleDashboardUpdate(interaction.guild).catch(() => null);

    const upcoming = await getUpcomingFixtures(5);
    const upcomingList = upcoming.length
      ? upcoming.map((item) => `• **${item.homeTeam} vs ${item.awayTeam}** · <t:${Math.floor(new Date(item.kickoff).getTime() / 1000)}:f> · ${item.competition}`).join('\n')
      : 'No upcoming fixtures.';

    const replyEmbed = new EmbedBuilder()
      .setTitle('✅ Fixture Posted to Fixtures Centre')
      .setDescription(`The fixture has been posted in <#${fixturesChannelId}> and uploaded to the website.`)
      .setColor('#00B37E')
      .addFields(
        { name: 'Latest Fixture', value: `${homeTeam.teamName} vs ${awayTeam.teamName}`, inline: true },
        { name: 'Kickoff', value: `<t:${kickoffUnix}:F>`, inline: true },
        { name: 'Upcoming Fixtures', value: upcomingList, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed] });
  },
};
