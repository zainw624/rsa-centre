/**
 * RSA Bot — /syncroles slash command
 * ====================================
 * Manually triggers a role sync for a specific member or the whole server.
 * Restricted to bot owner and high-permission staff only.
 *
 * Usage:
 *   /syncroles             — syncs the calling user
 *   /syncroles user:@user  — syncs a specific member (owner/admin only)
 *   /syncroles all:true    — syncs all server members (owner only)
 */

'use strict';

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { pushRoleSync } = require('../role-sync-helper');

const BOT_OWNER_ID = process.env.BOT_OWNER_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('syncroles')
    .setDescription('Sync member roles to the RSA Ops website')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('Member to sync (leave blank to sync yourself)').setRequired(false),
    )
    .addBooleanOption((opt) =>
      opt.setName('all').setDescription('Sync all server members (bot owner only)').setRequired(false),
    ),

  async execute(interaction) {
    const isOwner  = interaction.user.id === BOT_OWNER_ID;
    const syncAll  = interaction.options.getBoolean('all') ?? false;
    const target   = interaction.options.getMember('user');

    await interaction.deferReply({ ephemeral: true });

    // Sync entire guild — owner only
    if (syncAll) {
      if (!isOwner) {
        return interaction.editReply({ content: '❌ Only the bot owner can sync all members.' });
      }

      await interaction.editReply({ content: '🔄 Fetching all server members…' });

      try {
        await interaction.guild.members.fetch();
        const members = [...interaction.guild.members.cache.values()];
        let ok = 0, fail = 0;

        for (const member of members) {
          const result = await pushRoleSync(member, 'manual_sync').catch(() => null);
          if (result?.ok) ok++; else fail++;
        }

        return interaction.editReply({
          content: `✅ Sync complete — **${ok}** updated, **${fail}** failed out of **${members.length}** members.`,
        });
      } catch (err) {
        return interaction.editReply({ content: `❌ Sync failed: ${err.message}` });
      }
    }

    // Sync a specific member — owner or the member themselves
    const memberToSync = target ?? interaction.member;

    if (target && target.id !== interaction.user.id && !isOwner) {
      const isStaff = interaction.member?.permissions?.has?.(PermissionFlagsBits.ManageRoles) ?? false;
      if (!isStaff) {
        return interaction.editReply({ content: '❌ You can only sync your own roles.' });
      }
    }

    const result = await pushRoleSync(memberToSync, 'manual_sync').catch(() => null);

    if (result?.ok) {
      return interaction.editReply({
        content: `✅ Roles synced for <@${memberToSync.id}>.\n` +
          `Permission: **${result.permission}** · Roles stored: **${result.rolesStored ?? '?'}**` +
          (result.teamsJoined?.length ? `\nTeams joined: ${result.teamsJoined.join(', ')}` : ''),
      });
    } else {
      return interaction.editReply({
        content: `❌ Sync failed for <@${memberToSync.id}>. Check that WEBSITE_URL and ROLES_SYNC_SECRET are set correctly.`,
      });
    }
  },
};
