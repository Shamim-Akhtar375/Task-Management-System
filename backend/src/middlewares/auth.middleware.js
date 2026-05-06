const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.projectId;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });
    
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } }
    });
    
    if (!member) return res.status(403).json({ error: 'Forbidden' });
    req.memberRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.projectId;
    if (!projectId) {
      // If there's no project ID, maybe it's creating a project.
      // Since schema lacks global roles, any user can create a project.
      return next();
    }
    
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId } }
    });
    
    if (!member || member.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Requires Admin role for this project' });
    }
    req.memberRole = member.role;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireAuth, requireProjectMember, requireAdmin };
