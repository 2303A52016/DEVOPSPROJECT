const express = require('express');
const router = express.Router();
const { createVitalityRecord, getVitalityByUserId } = require('../controllers/vitalityController');

// POST /api/vitality - Add health/vitality record
router.post('/vitality', createVitalityRecord);

// GET /api/vitality/:user_id - Get all vitality records for a user
router.get('/vitality/:user_id', getVitalityByUserId);

module.exports = router;
