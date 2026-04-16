const pool = require('../config/db');
const localStore = require('../config/localStore');

// POST /api/planner - Add a planner activity
const createPlanner = async (req, res) => {
  const { user_id, activity, start_time, end_time, date } = req.body;

  try {
    // Validation
    if (!user_id || !activity || !start_time || !end_time || !date) {
      return res.status(400).json({
        message: 'Missing required fields: user_id, activity, start_time, end_time, date',
      });
    }

    const result = await pool.query(
      'INSERT INTO planner (user_id, activity, start_time, end_time, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, activity, start_time, end_time, date]
    );

    res.status(201).json({
      message: 'Planner activity created successfully',
      planner: result.rows[0],
    });
  } catch (error) {
    const planner = localStore.createPlanner({
      user_id,
      activity,
      start_time,
      end_time,
      date,
    });

    res.status(201).json({
      message: 'Planner activity created successfully (fallback mode)',
      planner,
    });
  }
};

// GET /api/planner/:user_id - Get all planner entries for a user
const getPlannerByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({
        message: 'user_id is required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM planner WHERE user_id = $1 ORDER BY date DESC, start_time',
      [user_id]
    );

    res.json({
      message: 'Planner entries retrieved successfully',
      planner: result.rows,
    });
  } catch (error) {
    res.json({
      message: 'Planner entries retrieved successfully (fallback mode)',
      planner: localStore.listPlannerByUser(user_id),
    });
  }
};

// PUT /api/planner/:id - Update planner activity
const updatePlanner = async (req, res) => {
  const { id } = req.params;
  const { activity, start_time, end_time, date } = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        message: 'Planner ID is required',
      });
    }

    // Check if planner entry exists
    const existingResult = await pool.query(
      'SELECT * FROM planner WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Planner entry not found',
      });
    }

    // Update only provided fields
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (activity !== undefined) {
      updateFields.push(`activity = $${paramCount}`);
      updateValues.push(activity);
      paramCount++;
    }
    if (start_time !== undefined) {
      updateFields.push(`start_time = $${paramCount}`);
      updateValues.push(start_time);
      paramCount++;
    }
    if (end_time !== undefined) {
      updateFields.push(`end_time = $${paramCount}`);
      updateValues.push(end_time);
      paramCount++;
    }
    if (date !== undefined) {
      updateFields.push(`date = $${paramCount}`);
      updateValues.push(date);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        message: 'No fields to update',
      });
    }

    updateValues.push(id);
    const query = `UPDATE planner SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, updateValues);

    res.json({
      message: 'Planner activity updated successfully',
      planner: result.rows[0],
    });
  } catch (error) {
    const updates = {};
    if (activity !== undefined) updates.activity = activity;
    if (start_time !== undefined) updates.start_time = start_time;
    if (end_time !== undefined) updates.end_time = end_time;
    if (date !== undefined) updates.date = date;

    const planner = localStore.updatePlanner(id, updates);
    if (!planner) {
      return res.status(404).json({ message: 'Planner entry not found' });
    }

    res.json({
      message: 'Planner activity updated successfully (fallback mode)',
      planner,
    });
  }
};

// DELETE /api/planner/:id - Delete planner activity
const deletePlanner = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        message: 'Planner ID is required',
      });
    }

    // Check if planner entry exists
    const existingResult = await pool.query(
      'SELECT * FROM planner WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Planner entry not found',
      });
    }

    await pool.query('DELETE FROM planner WHERE id = $1', [id]);

    res.json({
      message: 'Planner activity deleted successfully',
      id: id,
    });
  } catch (error) {
    const deleted = localStore.deletePlanner(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Planner entry not found' });
    }

    res.json({
      message: 'Planner activity deleted successfully (fallback mode)',
      id,
    });
  }
};

module.exports = {
  createPlanner,
  getPlannerByUserId,
  updatePlanner,
  deletePlanner,
};
