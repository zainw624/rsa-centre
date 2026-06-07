const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

const UPDATE_CHANNEL = 'rsa_updates';

async function publishUpdate(eventType, payload) {
  try {
    const message = JSON.stringify({ eventType, payload, timestamp: new Date().toISOString() });
    await prisma.$executeRaw`NOTIFY ${UPDATE_CHANNEL}, ${message}`;
  } catch (error) {
    console.error('❌ Failed to publish realtime update:', error);
  }
}

async function upsertTeam({ teamId, teamName, teamCode, logo, roleId, coachDiscordId, rosterLimit = 16 }) {
  const team = await prisma.team.upsert({
    where: { teamId },
    update: {
      teamName,
      teamCode,
      logo,
      roleId,
      coachDiscordId,
      rosterLimit,
    },
    create: {
      teamId,
      teamName,
      teamCode,
      logo,
      roleId,
      coachDiscordId,
      rosterLimit,
    },
  });
  await publishUpdate('teamUpdated', { teamId: team.teamId, teamName: team.teamName, teamCode: team.teamCode });
  return team;
}

async function findTeamByNameOrCode(value) {
  return prisma.team.findFirst({
    where: {
      OR: [{ teamName: value }, { teamCode: value }, { teamId: value }],
    },
  });
}

async function getTeamRoster(teamName) {
  return prisma.team.findFirst({
    where: { teamName },
    include: { rosterPlayers: true },
  });
}

async function addRosterPlayer({ teamId, playerId, playerTag, userId = null }) {
  const roster = await prisma.rosterPlayer.create({
    data: {
      team: { connect: { id: teamId } },
      playerId,
      playerTag,
      user: userId ? { connect: { id: userId } } : undefined,
      joinedAt: new Date(),
      active: true,
    },
  });

  await publishUpdate('rosterUpdated', { teamId, playerId, playerTag, action: 'add' });
  return roster;
}

async function removeRosterPlayer({ teamId, playerId }) {
  const roster = await prisma.rosterPlayer.findFirst({
    where: {
      teamId,
      playerId,
      active: true,
    },
  });
  if (!roster) {
    return null;
  }
  const updated = await prisma.rosterPlayer.update({
    where: { id: roster.id },
    data: { active: false },
  });
  await publishUpdate('rosterUpdated', { teamId, playerId, action: 'remove' });
  return updated;
}

async function createTransfer(data) {
  const transfer = await prisma.transfer.create({
    data: {
      transactionId: data.transactionId,
      type: data.type,
      status: data.status,
      action: data.action,
      playerId: data.playerId,
      playerTag: data.playerTag,
      fromTeam: data.fromTeam,
      toTeam: data.toTeam,
      team: data.teamId ? { connect: { id: data.teamId } } : undefined,
      sourceCommand: data.sourceCommand,
      reason: data.reason,
      guildId: data.guildId,
      staffId: data.staffId,
    },
  });

  await publishUpdate('transferCreated', { id: transfer.id, transactionId: transfer.transactionId, type: transfer.type, status: transfer.status, playerId: transfer.playerId });
  return transfer;
}

async function updateTransferStatus(transactionId, status) {
  const transfer = await prisma.transfer.update({
    where: { transactionId },
    data: { status, updatedAt: new Date() },
  });

  await publishUpdate('transferUpdated', { id: transfer.id, transactionId: transfer.transactionId, status: transfer.status });
  return transfer;
}

async function createSanction(data) {
  const sanction = await prisma.sanction.create({
    data: {
      sanctionType: data.sanctionType,
      status: data.status || 'active',
      playerId: data.playerId,
      playerTag: data.playerTag,
      roleId: data.roleId,
      reason: data.reason,
      team: data.teamId ? { connect: { id: data.teamId } } : undefined,
      imposedById: data.staffId,
      activeUntil: data.activeUntil || null,
    },
  });

  await publishUpdate('sanctionCreated', { id: sanction.id, playerId: sanction.playerId, sanctionType: sanction.sanctionType });
  return sanction;
}

async function createFixture(data) {
  const fixture = await prisma.fixture.create({
    data: {
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      homeTeamCode: data.homeTeamCode,
      awayTeamCode: data.awayTeamCode,
      kickoff: new Date(data.kickoff),
      competition: data.competition,
      venue: data.venue,
      notes: data.notes,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
    },
  });

  await publishUpdate('fixtureCreated', { id: fixture.id, homeTeam: fixture.homeTeam, awayTeam: fixture.awayTeam });
  return fixture;
}

async function createActivityLog(data) {
  const activity = await prisma.activityLog.create({
    data: {
      type: data.type,
      text: data.text,
      emoji: data.emoji || null,
      playerId: data.playerId || null,
      playerTag: data.playerTag || null,
      teamId: data.teamId || null,
      teamName: data.teamName || null,
      staffId: data.staffId || null,
      fixtureId: data.fixtureId || null,
      sanctionId: data.sanctionId || null,
      metadata: data.metadata || null,
    },
  });

  await publishUpdate('activityCreated', { id: activity.id, type: activity.type, text: activity.text });
  return activity;
}

async function createAuditLog(data) {
  const audit = await prisma.auditLog.create({
    data: {
      actionType: data.actionType,
      sourceCommand: data.sourceCommand || null,
      userId: data.userId || null,
      targetPlayerId: data.targetPlayerId || null,
      targetTeamId: data.targetTeamId || null,
      previousValue: data.previousValue || null,
      newValue: data.newValue || null,
      details: data.details || null,
    },
  });

  return audit;
}

async function upsertSettings(data) {
  const settings = await prisma.settings.upsert({
    where: { guildId: data.guildId },
    update: {
      botOwnerId: data.botOwnerId,
      transferWindowOpen: data.transferWindowOpen,
      worldCupMode: data.worldCupMode,
      freeAgentRoleName: data.freeAgentRoleName,
      sanctionedRoleId: data.sanctionedRoleId,
      cupTiedRoleId: data.cupTiedRoleId,
      managerRoleNames: data.managerRoleNames,
      sanctionRoleNames: data.sanctionRoleNames,
      auditRoleNames: data.auditRoleNames,
      worldCupLockRoleNames: data.worldCupLockRoleNames,
      worldCupUnlockRoleNames: data.worldCupUnlockRoleNames,
      staffCentreRoleNames: data.staffCentreRoleNames,
      contractsChannelId: data.contractsChannelId,
      releaseChannelId: data.releaseChannelId,
      fixturesAnnouncementChannelId: data.fixturesAnnouncementChannelId,
    },
    create: {
      guildId: data.guildId,
      botOwnerId: data.botOwnerId,
      transferWindowOpen: data.transferWindowOpen ?? true,
      worldCupMode: data.worldCupMode ?? false,
      freeAgentRoleName: data.freeAgentRoleName,
      sanctionedRoleId: data.sanctionedRoleId,
      cupTiedRoleId: data.cupTiedRoleId,
      managerRoleNames: data.managerRoleNames,
      sanctionRoleNames: data.sanctionRoleNames,
      auditRoleNames: data.auditRoleNames,
      worldCupLockRoleNames: data.worldCupLockRoleNames,
      worldCupUnlockRoleNames: data.worldCupUnlockRoleNames,
      staffCentreRoleNames: data.staffCentreRoleNames,
      contractsChannelId: data.contractsChannelId,
      releaseChannelId: data.releaseChannelId,
      fixturesAnnouncementChannelId: data.fixturesAnnouncementChannelId,
    },
  });

  await publishUpdate('settingsUpdated', { guildId: settings.guildId });
  return settings;
}

module.exports = {
  prisma,
  publishUpdate,
  upsertTeam,
  findTeamByNameOrCode,
  getTeamRoster,
  addRosterPlayer,
  removeRosterPlayer,
  createTransfer,
  updateTransferStatus,
  createSanction,
  createFixture,
  createActivityLog,
  createAuditLog,
  upsertSettings,
};
