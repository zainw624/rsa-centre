/**
 * RSA Bot — guildMemberUpdate event (with role-sync)
 * ===================================================
 * Merge this into your bot's guildMemberUpdate handler, or replace it.
 *
 * Calls the RSA Ops website role-sync endpoint whenever a member's roles
 * change in the Discord server.
 */

'use strict';

const { pushRoleSync } = require('../role-sync-helper');

// Import your existing helpers below — adjust paths to match your bot layout:
// const { getTeamByRoleId }   = require('../utils/teams');
// const { loadSettings }      = require('../utils/settings');
// const { buildIllegalSigningEmbed } = require('../utils/embeds');
// const ManagerManager  = require('../services/ManagerManager');
// const AssistantManager = require('../services/AssistantManager');

module.exports = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember, newMember) {
    if (!oldMember || !newMember) return;
    if (oldMember.guild.id !== newMember.guild.id) return;

    const oldRoleIds = new Set(oldMember.roles.cache.map((r) => r.id));
    const newRoleIds = new Set(newMember.roles.cache.map((r) => r.id));
    const rolesChanged =
      [...newRoleIds].some((id) => !oldRoleIds.has(id)) ||
      [...oldRoleIds].some((id) => !newRoleIds.has(id));

    if (!rolesChanged) return;

    // Push updated roles to the RSA Ops website (non-blocking, non-fatal)
    pushRoleSync(newMember, 'member_update').catch((err) => {
      console.warn('[guildMemberUpdate] role-sync push failed:', err?.message);
    });

    // ── Your existing role-change logic below ──────────────────────────────
    // Uncomment and restore any original code you had here, e.g.:
    //
    // const managerManager  = new ManagerManager();
    // const assistantManager = new AssistantManager();
    // await Promise.all([
    //   managerManager.initialize(),
    //   assistantManager.initialize(),
    // ]);
    // await managerManager.handleMemberRoleChange(oldMember, newMember).catch(console.warn);
    // await assistantManager.handleMemberRoleChange(oldMember, newMember).catch(console.warn);
    //
    // ... illegal signing detection etc.
  },
};
