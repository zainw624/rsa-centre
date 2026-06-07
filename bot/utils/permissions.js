function memberHasRoleNames(member, roleNames) {
  return member.roles.cache.some((role) => roleNames.includes(role.name));
}

function getRoleByName(guild, roleName) {
  return guild.roles.cache.find((role) => role.name === roleName) || null;
}

function hasAnyRoleByName(member, roleNames) {
  return member.roles.cache.some((role) => roleNames.includes(role.name));
}

module.exports = {
  memberHasRoleNames,
  getRoleByName,
  hasAnyRoleByName,
};
