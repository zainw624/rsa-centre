/**
 * RSA Bot — /scout slash command
 * ================================
 * Sends a scouting report/interest announcement.
 * Manager permission required.
 * Sends to the scouting channel.
 *
 * Channel IDs:
 *   Scouting:      1513527717453103285
 *   Bot commands:  1512871626637578371
 */

'use strict';

const { SlashCommandBuilder } = require('discord.js');

const SCOUTING_CHANNEL_ID = '1513527717453103285';
const MANAGER_ROLE_NAMES  = ['RSA | Managers', 'RSA | Assistant Managers'];

function hasManagerRole(member) {
  return member.roles.cache.some((r) => MANAGER_ROLE_NAMES.includes(r.name));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scout')
    .setDescription('Post a scouting report for a player')
    .addUserOption((o) => o.setName('player').setDescription('Player to scout').setRequired(true))
    .addStringOption((o) => o.setName('notes').setDescription('Scouting notes / interest').setRequired(false)),

  async execute(interaction) {
    if (!hasManagerRole(interaction.member)) {
      return interaction.reply({ content: '❌ Only managers may use this command.', flags: 64 });
    }

    const player = interaction.options.getMember('player');
    const notes  = interaction.options.getString('notes') ?? '';
    if (!player) return interaction.reply({ content: '❌ Player not found in this server.', flags: 64 });

    await interaction.deferReply({ ephemeral: true });

    const scoutChannel = await interaction.client.channels.fetch(SCOUTING_CHANNEL_ID).catch(() => null);
    if (!scoutChannel?.isTextBased()) {
      return interaction.editReply({ content: '❌ Could not find the scouting channel. Contact an admin.' });
    }

    await scoutChannel.send({
      embeds: [{
        color: 0x60A5FA,
        title: '🔍 Scouting Report',
        fields: [
          { name: 'Player',  value: `<@${player.id}>`,           inline: true },
          { name: 'Manager', value: `<@${interaction.user.id}>`, inline: true },
          ...(notes ? [{ name: 'Notes', value: notes, inline: false }] : []),
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'RSA Operations Centre · Scouting' },
      }],
    });

    return interaction.editReply({ content: `✅ Scouting report posted for <@${player.id}>.` });
  },
};
