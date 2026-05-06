const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userMemberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true, role: true }
    });
    const projectIds = userMemberships.map(m => m.projectId);
    
    const teamMembers = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } }
      }
    });

    const usersMap = {};
    for (const member of teamMembers) {
      if (!usersMap[member.user.id]) {
        usersMap[member.user.id] = {
          ...member.user,
          sharedProjects: [],
          roles: []
        };
      }
      usersMap[member.user.id].sharedProjects.push(member.project);
      usersMap[member.user.id].roles.push(member.role);
    }
    
    const team = Object.values(usersMap).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      sharedProjects: u.sharedProjects,
      role: u.roles.includes('ADMIN') ? 'ADMIN' : 'MEMBER'
    }));

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
