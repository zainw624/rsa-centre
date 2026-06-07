const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { loadSettings } = require('../utils/settings');
const { getTeamForMember } = require('../utils/teams');
const { memberHasRoleNames } = require('../utils/permissions');
const { getProcessedLogoAttachment } = require('../utils/logo');

const SCOUTING_CHANNEL_ID = '1483177386659807394';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scout')
    .setDescription('Post a scouting alert for your team to the official scouting channel'),

  async execute(interaction) {
    const settings = await loadSettings();
    await require('../utils/teams').syncRostersFromGuildRoles(interaction.guild).catch(() => null);

    if (interaction.channelId !== settings.botCommandsChannelId) {
      await interaction.reply({ content: '❌ This command can only be used in the designated bot commands channel.', flags: 64 });
      return;
    }

    if (!memberHasRoleNames(interaction.member, settings.managerRoleNames)) {
      await interaction.reply({ content: '❌ You do not have permission to use this command.', flags: 64 });
      return;
    }

    const team = await getTeamForMember(interaction.member);
    if (!team) {
      await interaction.reply({ content: '❌ You are not assigned to a national team.', flags: 64 });
      return;
    }

    const scoutingChannel = await interaction.client.channels.fetch(SCOUTING_CHANNEL_ID).catch(() => null);
    if (!scoutingChannel || !scoutingChannel.isTextBased()) {
      await interaction.reply({ content: '❌ Scouting channel is not available.', flags: 64 });
      return;
    }

    let logoAttachment = null;
    try {
      logoAttachment = await getProcessedLogoAttachment(team);
    } catch (err) {
      console.warn(`⚠️ Scout logo failed to process for ${team.teamName}: ${err.message}`);
    }

    const managerMention = team.coachDiscordId ? `<@${team.coachDiscordId}>` : 'Not assigned';
    const teamRoleName = team.roleId ? interaction.guild.roles.cache.get(team.roleId)?.name || 'Unknown role' : 'Unknown role';

    const embed = new EmbedBuilder()
      .setTitle('🕵️‍♂️ Team Scouting Alert')
      .setDescription('A new scouting notification has been posted for the team below.')
      .setColor('#1f1f1f')
      .addFields(
        { name: 'Team Name', value: team.teamName, inline: true },
        { name: 'Team Role', value: teamRoleName, inline: true },
        { name: 'Manager', value: managerMention, inline: true },
        { name: 'Scouting Notes', value: 'Add scouting details here...', inline: false }
      )
      .setFooter({ text: 'RSA | Roblox Soccer Association' })
      .setTimestamp();

    if (logoAttachment) {
      embed.setThumbnail(`attachment://${logoAttachment.name}`);
    }

    const sendPayload = { embeds: [embed], allowedMentions: { parse: ['users'], roles: [] } };
    if (logoAttachment) {
      sendPayload.files = [logoAttachment];
    }

    try {
      await scoutingChannel.send(sendPayload);
      await interaction.reply({ content: '✅ Scouting alert posted to the official scouting channel.', flags: 64 });
    } catch (error) {
      console.error('Failed to send scout alert:', error);
      await interaction.reply({ content: '❌ Failed to post scouting alert.', flags: 64 });
    }
  },
};
