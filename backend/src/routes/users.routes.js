const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar },
      select: { id: true, name: true, email: true, avatar: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const bcrypt = require('bcryptjs');
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ error: 'Invalid current password' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await prisma.user.findMany({
      where: {
        email: { contains: q }
      },
      select: { id: true, name: true, email: true, avatar: true },
      take: 10
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
