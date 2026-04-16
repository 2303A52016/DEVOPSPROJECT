const pool = require('../config/db');
const localStore = require('../config/localStore');

// POST /api/tasks - Create a task
const createTask = async (req, res) => {
  const { user_id, task, completed = false } = req.body;

  try {
    if (!user_id || !task) {
      return res.status(400).json({
        message: 'Missing required fields: user_id, task',
      });
    }

    const result = await pool.query(
      'INSERT INTO tasks (user_id, task, completed) VALUES ($1, $2, $3) RETURNING *',
      [user_id, task, completed]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    });
  } catch (error) {
    const createdTask = localStore.createTask({ user_id, task, completed });
    res.status(201).json({
      message: 'Task created successfully (fallback mode)',
      task: createdTask,
    });
  }
};

// GET /api/tasks/:user_id - Get all tasks for a user
const getTasksByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({
        message: 'user_id is required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC',
      [user_id]
    );

    res.json({
      message: 'Tasks retrieved successfully',
      tasks: result.rows,
    });
  } catch (error) {
    res.json({
      message: 'Tasks retrieved successfully (fallback mode)',
      tasks: localStore.listTasksByUser(user_id),
    });
  }
};

// PUT /api/tasks/:id - Update a task
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        message: 'Task ID is required',
      });
    }

    const existingResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (task !== undefined) {
      updateFields.push(`task = $${paramIndex}`);
      updateValues.push(task);
      paramIndex++;
    }

    if (completed !== undefined) {
      updateFields.push(`completed = $${paramIndex}`);
      updateValues.push(completed);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'No fields provided to update',
      });
    }

    updateValues.push(id);
    const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (error) {
    const updates = {};
    if (task !== undefined) updates.task = task;
    if (completed !== undefined) updates.completed = completed;

    const updatedTask = localStore.updateTask(id, updates);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully (fallback mode)',
      task: updatedTask,
    });
  }
};

// DELETE /api/tasks/:id - Delete a task
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        message: 'Task ID is required',
      });
    }

    const existingResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({
      message: 'Task deleted successfully',
      id: id,
    });
  } catch (error) {
    const deleted = localStore.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task deleted successfully (fallback mode)',
      id,
    });
  }
};

module.exports = {
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask,
};