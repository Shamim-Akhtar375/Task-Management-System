const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all projects where user is a member
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      select: { id: true }
    });
    const projectIds = projects.map(p => p.id);
    
    // Total tasks in user's projects
    const totalTasks = await prisma.task.count({ where: { projectId: { in: projectIds } } });
    
    // Completed tasks
    const completedTasks = await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } });
    
    // In progress tasks
    const inProgressTasks = await prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } });
    
    // Overdue tasks
    const now = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: now },
        status: { not: 'DONE' }
      }
    });
    
    // Tasks distribution
    const statusGroups = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: true
    });
    
    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        dueDate: { gte: now, lte: nextWeek },
        status: { not: 'DONE' }
      },
      include: { assignee: { select: { name: true, avatar: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5
    });
    
    // Recent activity (can just use latest updated tasks)
    const recentActivity = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, avatar: true } }
      }
    });

    res.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      statusGroups,
      upcomingTasks,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activity', requireAuth, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
