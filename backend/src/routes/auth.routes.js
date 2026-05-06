const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const router = express.Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
