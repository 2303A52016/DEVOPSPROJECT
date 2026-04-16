const pool = require('../config/db');
const localStore = require('../config/localStore');

// POST /api/vitality - Add health/vitality record
const createVitalityRecord = async (req, res) => {
  const { user_id, date, calories_burned } = req.body;

  try {
    if (!user_id || !date || calories_burned === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: user_id, date, calories_burned',
      });
    }

    const result = await pool.query(
      'INSERT INTO vitality (user_id, date, calories_burned) VALUES ($1, $2, $3) RETURNING *',
      [user_id, date, calories_burned]
    );

    res.status(201).json({
      message: 'Vitality record created successfully',
      vitality: result.rows[0],
    });
  } catch (error) {
    const vitality = localStore.createVitality({ user_id, date, calories_burned });
    res.status(201).json({
      message: 'Vitality record created successfully (fallback mode)',
      vitality,
    });
  }
};

// GET /api/vitality/:user_id - Get all vitality records for a user
const getVitalityByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    if (!user_id) {
      return res.status(400).json({
        message: 'user_id is required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM vitality WHERE user_id = $1 ORDER BY date DESC, id DESC',
      [user_id]
    );

    res.json({
      message: 'Vitality records retrieved successfully',
      vitality: result.rows,
    });
  } catch (error) {
    res.json({
      message: 'Vitality records retrieved successfully (fallback mode)',
      vitality: localStore.listVitalityByUser(user_id),
    });
  }
};

module.exports = {
  createVitalityRecord,
  getVitalityByUserId,
};
