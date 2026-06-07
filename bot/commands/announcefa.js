const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { memberHasRoleNames } = require('../utils/permissions');

const BOT_COMMANDS_CHANNEL_ID = '1512871626637578371';
const FREE_AGENT_BOARD_CHANNEL_ID = '1469398414474346720';
const FREE_AGENT_ROLE_NAME = 'Free Agent';
const TEAM_ROLE_NAMES = ['Spain', 'France', 'England', 'Germany', 'Portugal'];
const DEFAULT_POSITION = 'Not Specified';

const freeAgentRoster = new Map();

function detectTeamRoles(member) {
  return member.roles.cache
    .filter((role) => TEAM_ROLE_NAMES.includes(role.name))
    .map((role) => role.name);
}

module.exports = {
  data: new SlashCommandBuilder().setName('announcefa').setDescription('Post a Free Agent announcement to the RSA Free Agent Board'),

  async execute(interaction) {
    if (interaction.channelId !== BOT_COMMANDS_CHANNEL_ID) {
      await interaction.reply({
        content: '❌ This command may only be used in the designated bot commands channel.',
        flags: 64,
      });
      return;
    }

    if (!memberHasRoleNames(interaction.member, [FREE_AGENT_ROLE_NAME])) {
      await interaction.reply({
        content: '❌ You must have the Free Agent role to use this command.',
        flags: 64,
      });
      return;
    }

    const boardChannel = await interaction.client.channels.fetch(FREE_AGENT_BOARD_CHANNEL_ID).catch(() => null);
    if (!boardChannel || !boardChannel.isTextBased()) {
      await interaction.reply({
        content: '❌ The Free Agent Board channel is unavailable.',
        flags: 64,
      });
      return;
    }

    const detectedTeams = detectTeamRoles(interaction.member);
    const detectedTeamsText = detectedTeams.length ? detectedTeams.join(', ') : 'None';
    const user = interaction.user;
    const displayName = interaction.member.displayName || user.username;
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 1024, forceStatic: false });

    const announcementEmbed = new EmbedBuilder()
      .setTitle('Free Agent Announcement')
      .setColor(0xffd700)
      .setAuthor({ name: user.username, iconURL: avatarUrl })
      .setThumbnail(avatarUrl)
      .setDescription(`Free Agent — ${displayName}`)
      .addFields(
        { name: 'Discord', value: `<@${user.id}>`, inline: true },
        { name: 'Roblox Username', value: user.username, inline: true },
        { name: 'Position', value: DEFAULT_POSITION, inline: true },
        { name: 'Detected Teams', value: detectedTeamsText, inline: false }
      )
      .setFooter({ text: 'RFA Free Agent Board' })
      .setTimestamp();

    try {
      await boardChannel.send({ embeds: [announcementEmbed] });
    } catch (error) {
      console.error('Failed to post Free Agent announcement:', error);
      await interaction.reply({
        content: '❌ Unable to post the Free Agent announcement at this time.',
        flags: 64,
      });
      return;
    }

    freeAgentRoster.set(user.id, {
      userId: user.id,
      username: user.tag,
      detectedTeams,
      announcedAt: new Date().toISOString(),
    });

    await interaction.reply({
      content: 'Free Agent announcement posted successfully.',
      flags: 64,
    });
  },

  freeAgentRoster,
};
