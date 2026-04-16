const express = require('express');
const router = express.Router();
const { createDiaryEntry, getDiaryByUserId } = require('../controllers/diaryController');

// POST /api/diary - Create diary entry
router.post('/diary', createDiaryEntry);

// GET /api/diary/:user_id - Get all diary entries for a user
router.get('/diary/:user_id', getDiaryByUserId);

module.exports = router;
