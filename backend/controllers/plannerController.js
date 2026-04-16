const pool = require('../config/db');

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
    console.error('Create planner error:', error);
    res.status(500).json({
      message: 'Error creating planner entry',
      error: error.message,
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
    console.error('Get planner error:', error);
    res.status(500).json({
      message: 'Error fetching planner entries',
      error: error.message,
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
    console.error('Update planner error:', error);
    res.status(500).json({
      message: 'Error updating planner entry',
      error: error.message,
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
    console.error('Delete planner error:', error);
    res.status(500).json({
      message: 'Error deleting planner entry',
      error: error.message,
    });
  }
};

module.exports = {
  createPlanner,
  getPlannerByUserId,
  updatePlanner,
  deletePlanner,
};
