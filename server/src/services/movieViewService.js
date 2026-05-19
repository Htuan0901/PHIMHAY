const MovieView = require('../models/MovieView');
const Movie = require('../models/Movie');
const { getClientIp } = require('../utils/requestMeta');

async function recordMovieView(req, movieId, userId = null) {
  try {
    await MovieView.create({
      userId: userId || req.user?._id || null,
      movieId,
      ipAddress: getClientIp(req)
    });
    await Movie.findByIdAndUpdate(movieId, { $inc: { viewCount: 1 } });
  } catch (err) {
    console.error('[MovieView]', err.message);
  }
}

module.exports = { recordMovieView };
