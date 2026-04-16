const express = require('express');
const router = express.Router();
const {
  createPlanner,
  getPlannerByUserId,
  updatePlanner,
  deletePlanner,
} = require('../controllers/plannerController');

// POST /api/planner - Add a planner activity
router.post('/planner', createPlanner);

// GET /api/planner/:user_id - Get all planner entries for a user
router.get('/planner/:user_id', getPlannerByUserId);

// PUT /api/planner/:id - Update planner activity
router.put('/planner/:id', updatePlanner);

// DELETE /api/planner/:id - Delete planner activity
router.delete('/planner/:id', deletePlanner);

module.exports = router;
