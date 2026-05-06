const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/projects.routes');
const taskRoutes = require('./routes/tasks.routes');
const userRoutes = require('./routes/users.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const teamRoutes = require('./routes/team.routes');

const app = express();

app.get('/', (req, res) => {
  res.send('TaskFlow API is running. Please access the app via the frontend at http://localhost:5173');
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/team', teamRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
