const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { memberHasRoleNames } = require('../utils/permissions');
const { loadSettings } = require('../utils/settings');
const { loadTeams, getTeamByReference } = require('../utils/teams');
const { getProcessedLogoAttachment } = require('../utils/logo');
const { addFixture, parseKickoffDate, getUpcomingFixtures } = require('../utils/fixtures');
const { addActivityEvent } = require('../utils/dashboardStorage');
const { scheduleDashboardUpdate } = require('../events/dashboardAutoUpdate');

const FIXTURE_ANNOUNCE_ROLES = ['RSA | Founders', 'RSA | Co Founders', 'RSA | Executive'];
const DEFAULT_FIXTURE_CHANNEL_ID = '1509978110647336990';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announcefix')
    .setDescription('Post a fixture announcement to the RSA Fixtures Centre')
    .addStringOption((option) =>
      option
        .setName('home_team')
        .setDescription('Home team name or code')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('away_team')
        .setDescription('Away team name or code')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('kickoff')
        .setDescription('Kickoff date/time in UTC (YYYY-MM-DD HH:mm or ISO format)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('competition')
        .setDescription('Competition or tournament name')
        .setRequired(true)
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

    const homeInput = interaction.options.getString('home_team').trim();
    const awayInput = interaction.options.getString('away_team').trim();
    const kickoffInput = interaction.options.getString('kickoff').trim();
    const competition = interaction.options.getString('competition').trim();
    const venue = interaction.options.getString('venue')?.trim() || 'TBD';
    const notes = interaction.options.getString('notes')?.trim() || '';

    const teams = await loadTeams();
    const homeTeam =
      (await getTeamByReference(homeInput, interaction.guild)) ||
      teams.find(
        (team) =>
          team.teamName.toLowerCase() === homeInput.toLowerCase() ||
          team.teamCode.toLowerCase() === homeInput.toLowerCase() ||
          team.teamId.toLowerCase() === homeInput.toLowerCase()
      );
    const awayTeam =
      (await getTeamByReference(awayInput, interaction.guild)) ||
      teams.find(
        (team) =>
          team.teamName.toLowerCase() === awayInput.toLowerCase() ||
          team.teamCode.toLowerCase() === awayInput.toLowerCase() ||
          team.teamId.toLowerCase() === awayInput.toLowerCase()
      );

    if (!homeTeam || !awayTeam) {
      await interaction.reply({ content: '❌ One or both teams were not found. Use the exact team name or team code.', flags: 64 });
      return;
    }

    if (homeTeam.teamId === awayTeam.teamId) {
      await interaction.reply({ content: '❌ Home and away teams must be different.', flags: 64 });
      return;
    }

    const kickoffDate = parseKickoffDate(kickoffInput);
    if (!kickoffDate) {
      await interaction.reply({ content: '❌ Kickoff date/time could not be parsed. Use UTC format like `2026-06-07 18:30` or full ISO format.', flags: 64 });
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

    const fixture = await addFixture({
      homeTeam: homeTeam.teamName,
      awayTeam: awayTeam.teamName,
      homeTeamCode: homeTeam.teamCode,
      awayTeamCode: awayTeam.teamCode,
      kickoff: kickoffDate.toISOString(),
      competition,
      venue,
      notes,
      creatorId: interaction.user.id,
      creatorName: interaction.user.tag,
    });

    const fixtureEmbed = new EmbedBuilder()
      .setTitle(`📅 Fixture Announcement: ${homeTeam.teamName} vs ${awayTeam.teamName}`)
      .setDescription(`**${competition}**`)
      .setColor('#00B37E')
      .addFields(
        { name: 'Home', value: homeTeam.teamName, inline: true },
        { name: 'Away', value: awayTeam.teamName, inline: true },
        { name: 'Kickoff', value: `<t:${Math.floor(kickoffDate.getTime() / 1000)}:F> (UTC)`, inline: false },
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
      .setDescription(`The fixture has been posted in <#${fixturesChannelId}> and stored for future display.`)
      .setColor('#00B37E')
      .addFields(
        { name: 'Latest Fixture', value: `${homeTeam.teamName} vs ${awayTeam.teamName}`, inline: true },
        { name: 'Kickoff', value: `<t:${Math.floor(kickoffDate.getTime() / 1000)}:F>`, inline: true },
        { name: 'Upcoming Fixtures', value: upcomingList, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [replyEmbed] });
  },
};
