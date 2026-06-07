const { EmbedBuilder } = require('discord.js');
const { loadSettings } = require('./settings');

const DEFAULT_STAFF_ROLES = [
  'RSA | Founders',
  'RSA | Co Founders',
  'RSA | Executive',
  'RSA | Chairman',
  'RSA | Vice Chairman',
  'RSA | Board of Directors',
  'RSA | Director',
  'RSA | Head of Development',
  'RSA | Head Of Staff',
  'RSA | Developer',
  'RSA | Senior Staff',
  'RSA | Staff',
  'RSA | Media',
  'RSA | Panel',
  'RSA | Officials',
];

const STAFF_DEPARTMENT_MAP = {
  'RSA | Founders': 'Executive Leadership',
  'RSA | Co Founders': 'Executive Leadership',
  'RSA | Executive': 'Executive Leadership',
  'RSA | Chairman': 'Executive Leadership',
  'RSA | Vice Chairman': 'Executive Leadership',
  'RSA | Board of Directors': 'Board Leadership',
  'RSA | Director': 'Board Leadership',
  'RSA | Head of Development': 'Administration',
  'RSA | Head Of Staff': 'Administration',
  'RSA | Developer': 'Administration',
  'RSA | Senior Staff': 'Administration',
  'RSA | Staff': 'Administration',
  'RSA | Media': 'Operations Team',
  'RSA | Panel': 'Operations Team',
  'RSA | Officials': 'League Operations',
};

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
      department: STAFF_DEPARTMENT_MAP[name] || 'Administration',
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
    const department = role.department || 'Administration';
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
