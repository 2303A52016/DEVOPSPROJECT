const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/initDb');

const authRoutes = require('./routes/authRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const tasksRoutes = require('./routes/tasksRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const vitalityRoutes = require('./routes/vitalityRoutes');

const app = express();
let dbReady = false;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', plannerRoutes);
app.use('/api', tasksRoutes);
app.use('/api', diaryRoutes);
app.use('/api', vitalityRoutes);

app.get('/', (req, res) => {
  res.send('Life Planner Backend Running 🚀');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: dbReady ? 'connected' : 'fallback-local-store',
  });
});

const PORT = 5000;

async function startServer() {
  try {
    await initializeDatabase();
    dbReady = true;
  } catch (error) {
    console.warn('Database initialization failed, running in fallback local-store mode:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Life Planner API running on port ${PORT}`);
  });
}

startServer();
