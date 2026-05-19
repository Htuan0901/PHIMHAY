const mongoose = require('mongoose');

const movieViewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    ipAddress: { type: String, default: '' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

movieViewSchema.index({ createdAt: -1 });
movieViewSchema.index({ movieId: 1, createdAt: -1 });

module.exports = mongoose.model('MovieView', movieViewSchema);
