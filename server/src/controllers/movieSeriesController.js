const Movie = require('../models/Movie');
const mongoose = require('mongoose');

/**
 * Gán một nhóm phim vào cùng một series.
 * seriesId sẽ là ID của phim chính (phim đầu tiên trong danh sách).
 */
async function assignMovieToSeries(req, res) {
  const { id } = req.params; // ID của phim chính, được dùng làm seriesId
  const { movieIds } = req.body; // Mảng chứa ID của tất cả các phim trong series

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID phim chính không hợp lệ' });
  }

  if (!Array.isArray(movieIds) || movieIds.length < 2) {
    return res.status(400).json({ error: 'Cần ít nhất 2 phim để tạo series' });
  }

  // Đảm bảo tất cả các phim trong danh sách đều được gán vào series
  const uniqueMovieIds = [...new Set([id, ...movieIds])];

  try {
    const seriesId = id; // Sử dụng ID của phim chính làm ID cho series

    await Movie.updateMany(
      { _id: { $in: uniqueMovieIds } },
      { $set: { seriesId: seriesId } }
    );

    res.json({ message: `Đã liên kết ${uniqueMovieIds.length} phim vào series.`, seriesId });
  } catch (e) {
    console.error('Error assigning movies to series:', e);
    res.status(500).json({ error: 'Lỗi server khi liên kết phim.' });
  }
}

/**
 * Lấy danh sách các phần của series cho một phim.
 */
async function getMovieSeriesParts(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID phim không hợp lệ' });
  }

  try {
    const movie = await Movie.findById(id).lean();
    if (!movie || !movie.seriesId) {
      return res.json({ items: [] });
    }

    const seriesParts = await Movie.find({ seriesId: movie.seriesId, isActive: true }).sort({ year: 1, createdAt: 1 }).lean();
    res.json({ items: seriesParts });
  } catch (e) {
    console.error('Error getting movie series parts:', e);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách series.' });
  }
}

module.exports = { assignMovieToSeries, getMovieSeriesParts };