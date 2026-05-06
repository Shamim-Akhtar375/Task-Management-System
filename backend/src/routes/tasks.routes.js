const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middlewares/auth.middleware');
const { logActivity } = require('../lib/activity');

const router = express.Router({ mergeParams: true });

// Since we placed app.use('/api/tasks', taskRoutes) and also /api/projects/:projectId/tasks
// Wait, I should make sure app.use('/api/projects/:projectId/tasks', taskRoutes) is added in index.js or just route manually here.
// Instead, I'll add the project routes in here.

router.get('/my-tasks', requireAuth, async (req, res) => {
  try {
    const { status, priority, projectId, search, sortBy } = req.query;
    
    const where = { assigneeId: req.user.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (search) where.title = { contains: search };
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, color: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: sortBy === 'dueDate' ? { dueDate: 'asc' } : { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/project/:projectId', requireAuth, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const member = await prisma.projectMember.findUnique({ where: { userId_projectId: { userId: req.user.id, projectId } } });
    if (!member) return res.status(403).json({ error: 'Forbidden' });
    
    const { status, priority, assignee, search, sort } = req.query;
    
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignee && { assigneeId: assignee }),
        ...(search && { title: { contains: search } })
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        comments: true
      },
      orderBy: sort ? { [sort]: 'asc' } : { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/project/:projectId', requireAuth, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const member = await prisma.projectMember.findUnique({ where: { userId_projectId: { userId: req.user.id, projectId } } });
    if (!member) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, status, priority, dueDate, assigneeId, tags } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId,
        creatorId: req.user.id,
        tags: tags ? JSON.stringify(tags) : '[]'
      }
    });

    await logActivity({
      type: 'CREATE',
      entity: 'TASK',
      entityId: task.id,
      entityTitle: task.title,
      action: `created task ${task.title}`,
      userId: req.user.id
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        creator: { select: { id: true, name: true, avatar: true } },
        comments: { include: { author: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'asc' } },
        project: { select: { name: true, color: true } }
      }
    });
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status }
    });

    await logActivity({
      type: 'UPDATE',
      entity: 'TASK',
      entityId: task.id,
      entityTitle: task.title,
      action: `updated status to ${status} for ${task.title}`,
      userId: req.user.id
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.comment.deleteMany({ where: { taskId: req.params.id } });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: req.params.id,
        authorId: req.user.id
      },
      include: { 
        author: { select: { id: true, name: true, avatar: true } },
        task: { select: { title: true } }
      }
    });

    await logActivity({
      type: 'COMMENT',
      entity: 'TASK',
      entityId: req.params.id,
      entityTitle: comment.task.title,
      action: `commented on ${comment.task.title}`,
      userId: req.user.id
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
