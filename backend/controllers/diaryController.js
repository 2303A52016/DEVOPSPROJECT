const pool = require('../config/db');

// POST /api/diary - Create diary entry
const createDiaryEntry = async (req, res) => {
  const { user_id, date, mood, entry } = req.body;

  try {
    if (!user_id || !date || !mood || !entry) {
      return res.status(400).json({
        message: 'Missing required fields: user_id, date, mood, entry',
      });
    }

    const result = await pool.query(
      'INSERT INTO diary (user_id, date, mood, entry) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, date, mood, entry]
    );

    res.status(201).json({
      message: 'Diary entry created successfully',
      diary: result.rows[0],
    });
  } catch (error) {
    console.error('Create diary entry error:', error);
    res.status(500).json({
      message: 'Error creating diary entry',
      error: error.message,
    });
  }
};

// GET /api/diary/:user_id - Get all diary entries for a user
const getDiaryByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({
        message: 'user_id is required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM diary WHERE user_id = $1 ORDER BY date DESC, id DESC',
      [user_id]
    );

    res.json({
      message: 'Diary entries retrieved successfully',
      diary: result.rows,
    });
  } catch (error) {
    console.error('Get diary error:', error);
    res.status(500).json({
      message: 'Error fetching diary entries',
      error: error.message,
    });
  }
};

module.exports = {
  createDiaryEntry,
  getDiaryByUserId,
};
