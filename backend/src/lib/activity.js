const prisma = require('./prisma');

async function logActivity({ type, entity, entityId, entityTitle, action, userId }) {
  try {
    await prisma.activity.create({
      data: {
        type,
        entity,
        entityId,
        entityTitle,
        action,
        userId
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

module.exports = { logActivity };
