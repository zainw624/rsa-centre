const staffCentreStorage = require('../utils/staffCentreStorage');
const { scanStaffCentre, buildStaffCentreEmbed } = require('../utils/staffCentre');

let updateCooldown = 0;
const COOLDOWN_MS = 5000;

async function scheduleStaffCentreUpdate(guild) {
  const now = Date.now();
  if (now - updateCooldown < COOLDOWN_MS) {
    return;
  }

  updateCooldown = now;

  try {
    const staffCentre = await staffCentreStorage.load();

    if (staffCentre.guildId !== guild.id || !staffCentre.channelId || !staffCentre.messageId) {
      return;
    }

    const channel = await guild.channels.fetch(staffCentre.channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      staffCentre.channelId = null;
      staffCentre.messageId = null;
      await staffCentreStorage.save(staffCentre);
      return;
    }

    let message = await channel.messages.fetch(staffCentre.messageId).catch(() => null);
    if (!message) {
      const staffRoles = await scanStaffCentre(guild);
      const embed = buildStaffCentreEmbed(staffRoles);
      message = await channel.send({ embeds: [embed] });
      staffCentre.messageId = message.id;
    } else {
      const staffRoles = await scanStaffCentre(guild);
      const embed = buildStaffCentreEmbed(staffRoles);
      await message.edit({ embeds: [embed] });
    }

    staffCentre.lastUpdated = new Date().toISOString();
    await staffCentreStorage.save(staffCentre);
  } catch (error) {
    console.error('Error updating RSA Staff Centre:', error);
  }
}

module.exports = [
  {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
      if (!oldMember || !newMember || oldMember.guild.id !== newMember.guild.id) return;
      const oldRoleIds = new Set(oldMember.roles.cache.map((role) => role.id));
      const newRoleIds = new Set(newMember.roles.cache.map((role) => role.id));
      const changed = [...oldRoleIds].some((id) => !newRoleIds.has(id)) || [...newRoleIds].some((id) => !oldRoleIds.has(id));
      if (changed) {
        await scheduleStaffCentreUpdate(newMember.guild);
      }
    },
  },
  {
    name: 'guildMemberAdd',
    async execute(member) {
      await scheduleStaffCentreUpdate(member.guild);
    },
  },
  {
    name: 'guildMemberRemove',
    async execute(member) {
      await scheduleStaffCentreUpdate(member.guild);
    },
  },
  {
    name: 'roleCreate',
    async execute(role) {
      await scheduleStaffCentreUpdate(role.guild);
    },
  },
  {
    name: 'roleDelete',
    async execute(role) {
      await scheduleStaffCentreUpdate(role.guild);
    },
  },
  {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
      await scheduleStaffCentreUpdate(newRole.guild);
    },
  },
  {
    name: 'appReady',
    once: true,
    async execute(client) {
      for (const guild of client.guilds.cache.values()) {
        const staffCentre = await staffCentreStorage.load();
        if (staffCentre.guildId === guild.id) {
          await scheduleStaffCentreUpdate(guild);
        }
      }
    },
  },
];
