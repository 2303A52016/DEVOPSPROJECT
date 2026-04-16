const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask,
} = require('../controllers/tasksController');

// POST /api/tasks - Create a task
router.post('/tasks', createTask);

// GET /api/tasks/:user_id - Get all tasks for a user
router.get('/tasks/:user_id', getTasksByUserId);

// PUT /api/tasks/:id - Update task
router.put('/tasks/:id', updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/tasks/:id', deleteTask);

module.exports = router;
