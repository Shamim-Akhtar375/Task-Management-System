const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { requireAuth, requireAdmin, requireProjectMember } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.user.id }
        }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        tasks: { select: { status: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, color, icon, deadline } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color,
        icon,
        deadline: deadline ? new Date(deadline) : null,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requireAuth, requireProjectMember, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true, email: true } } } },
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, color, icon, deadline } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, color, icon, deadline: deadline ? new Date(deadline) : null }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.comment.deleteMany({ where: { task: { projectId: req.params.id } } });
    await prisma.task.deleteMany({ where: { projectId: req.params.id } });
    await prisma.projectMember.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/invite', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: req.params.id,
        role: role || 'MEMBER'
      }
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/members/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: {
        userId_projectId: { userId: req.params.userId, projectId: req.params.id }
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/members/:userId/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const member = await prisma.projectMember.update({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } },
      data: { role }
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
