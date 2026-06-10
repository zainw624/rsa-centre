const { EmbedBuilder } = require('discord.js');
const { loadSettings } = require('./settings');
const { HIERARCHY, DEPARTMENT_MAP } = require('./hierarchy');

const DEFAULT_STAFF_ROLES = [...HIERARCHY];

const STAFF_DEPARTMENT_MAP = DEPARTMENT_MAP;

function normalizeRoleName(roleName) {
  return roleName.trim();
}

async function scanStaffCentre(guild) {
  const settings = await loadSettings();
  const roleNames = settings.staffCentreRoleNames || DEFAULT_STAFF_ROLES;
  const staffRoles = roleNames.map((rawName) => {
    const name = normalizeRoleName(rawName);
    return {
      roleName: name,
      department: STAFF_DEPARTMENT_MAP[name] || 'Staff',
      members: [],
      status: 'Vacant',
      roleId: null,
    };
  });

  await guild.members.fetch({ limit: 1000 }).catch(() => null);

  for (const staffRole of staffRoles) {
    const role = guild.roles.cache.find((roleEntry) => roleEntry.name === staffRole.roleName);
    if (!role) {
      staffRole.status = 'Vacant';
      continue;
    }
    staffRole.roleId = role.id;
    const members = Array.from(role.members.values());
    staffRole.members = members.map((member) => ({
      userId: member.id,
      username: `${member.user.username}#${member.user.discriminator}`,
      displayName: member.displayName,
      avatarUrl: member.user.displayAvatarURL({ dynamic: true, size: 64 }),
      role: staffRole.roleName,
      department: staffRole.department,
      status: 'Active',
      mention: member.toString(),
    }));
    staffRole.status = staffRole.members.length > 0 ? 'Active' : 'Vacant';
  }

  return staffRoles;
}

function buildStaffCentreEmbed(staffRoles) {
  const embed = new EmbedBuilder()
    .setTitle('🏛️ RSA Staff Centre')
    .setDescription('Live staff roster for RSA leadership, administration, operations, and league support teams.')
    .setColor('#1f1f1f')
    .setTimestamp(new Date())
    .setFooter({ text: 'Automatically updated based on role membership' });

  const rolesByDepartment = staffRoles.reduce((acc, role) => {
    const department = role.department || 'Staff';
    acc[department] = acc[department] || [];
    acc[department].push(role);
    return acc;
  }, {});

  for (const department of Object.keys(rolesByDepartment)) {
    const departmentRoles = rolesByDepartment[department];
    for (const role of departmentRoles) {
      const roleFieldName = `${role.roleName} • ${department}`;
      let fieldValue;
      if (role.members.length > 0) {
        fieldValue = role.members
          .map((member) =>
            `• **${member.displayName}** (${member.username})
  Role: ${member.role}
  Status: ${member.status}
  Avatar: ${member.avatarUrl}`
          )
          .join('\n\n');
      } else {
        fieldValue = `• Status: Vacant`;
      }
      embed.addFields({ name: roleFieldName, value: fieldValue, inline: false });
    }
  }

  return embed;
}

module.exports = {
  scanStaffCentre,
  buildStaffCentreEmbed,
  DEFAULT_STAFF_ROLES,
};
