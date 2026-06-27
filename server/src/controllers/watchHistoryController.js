const WatchHistory = require('../models/WatchHistory');
const Movie = require('../models/Movie');
const { logActivity } = require('../services/activityLogService');
const { recordMovieView } = require('../services/movieViewService');

exports.updateHistory = async (req, res) => {
  const { movieId, episode, currentTime } = req.body;
  const userId = req.user._id;

  try {
    if (!movieId) {
      return res.status(400).json({ error: 'movieId is required' });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    let history = await WatchHistory.findOne({ userId, movieId, episode });
    if (history) {
      history.currentTime = currentTime;
      await history.save();
    } else {
      history = new WatchHistory({ userId, movieId, episode, currentTime });
      await history.save();
    }

    await recordMovieView(req, movieId, userId);
    if (currentTime > 0) {
      await logActivity(req, {
        action: 'user.watched_movie',
        targetType: 'movie',
        targetId: movieId,
        metadata: { episode, currentTime, title: movie.title }
      });
    }

    res.status(200).json({ message: 'History updated', data: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  const userId = req.user._id;

  try {
    const history = await WatchHistory.find({ userId })
      .populate('movieId', 'title slug posterUrl thumbUrl')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** One entry per series/movie — most recently watched episode only (for homepage). */
function groupKeyForHistoryItem(item) {
  const movie = item.movieId;
  if (!movie) return null;
  const seriesId = movie.seriesId && String(movie.seriesId).trim();
  if (seriesId) return `series:${seriesId}`;
  return `movie:${movie._id}`;
}

exports.getContinueWatching = async (req, res) => {
  const userId = req.user._id;
  const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 6));

  try {
    const history = await WatchHistory.find({ userId })
      .populate('movieId', 'title slug posterUrl thumbUrl seriesId')
      .sort({ updatedAt: -1 })
      .lean();

    const byGroup = new Map();
    for (const item of history) {
      const key = groupKeyForHistoryItem(item);
      if (!key || byGroup.has(key)) continue;
      byGroup.set(key, item);
    }

    const items = Array.from(byGroup.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHistory = async (req, res) => {
  const { historyId } = req.params;
  const userId = req.user._id;

  try {
    const history = await WatchHistory.findOneAndDelete({ _id: historyId, userId });
    if (!history) {
      return res.status(404).json({ error: 'History not found' });
    }

    res.status(200).json({ message: 'History deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearAllHistory = async (req, res) => {
  const userId = req.user._id;

  try {
    await WatchHistory.deleteMany({ userId });
    res.status(200).json({ message: 'All history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
