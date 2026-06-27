const express = require('express');
const router = express.Router();
const {
  updateHistory,
  getHistory,
  getContinueWatching,
  deleteHistory,
  clearAllHistory
} = require('../controllers/watchHistoryController');
const { requireAuth } = require('../middleware/auth');

// Update or create watch history
router.post('/', requireAuth, updateHistory);

// Continue watching (one entry per series/movie)
router.get('/continue', requireAuth, getContinueWatching);

// Full watch history log
router.get('/', requireAuth, getHistory);

// Delete specific history item
router.delete('/:historyId', requireAuth, deleteHistory);

// Clear all history
router.delete('/', requireAuth, clearAllHistory);

module.exports = router;
