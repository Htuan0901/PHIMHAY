const User = require('../models/User');
const Movie = require('../models/Movie');
const MovieView = require('../models/MovieView');
const ActivityLog = require('../models/ActivityLog');
const WatchHistory = require('../models/WatchHistory');

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n) {
  const d = startOfDay();
  d.setDate(d.getDate() - n);
  return d;
}

async function getOverview() {
  const today = startOfDay();
  const [totalUsers, totalMovies, totalViews, newUsersToday, vipUsers, movieViewSum] =
    await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      MovieView.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({
        isVip: true,
        $or: [{ isUnlimitedVip: true }, { vipExpiresAt: { $gt: new Date() } }, { vipExpiresAt: null }]
      }),
      Movie.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
    ]);

  const totalViewCount = movieViewSum[0]?.total ?? totalViews;

  const mostViewed = await Movie.find()
    .sort({ viewCount: -1 })
    .limit(10)
    .select('title slug viewCount posterUrl')
    .lean();

  const recentLogins = await ActivityLog.find({ action: 'user.login' })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('actorId', 'displayName email')
    .lean();

  const recentlyActive = recentLogins.map((log) => ({
    userId: log.actorId?._id,
    username: log.actorId?.displayName,
    email: log.actorId?.email,
    lastActive: log.createdAt
  }));

  return {
    totalUsers,
    totalMovies,
    totalViews: totalViewCount,
    newUsersToday,
    vipUsers,
    mostViewedMovies: mostViewed,
    recentlyActiveUsers: recentlyActive.filter((u) => u.userId)
  };
}

async function aggregateByDay(Model, match, days = 14) {
  const since = daysAgo(days - 1);
  const pipeline = [
    { $match: { ...match, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];
  return Model.aggregate(pipeline);
}

async function getCharts(days = 14) {
  const [dailyActive, movieViews, registrations, vipSubs] = await Promise.all([
    aggregateByDay(ActivityLog, { action: 'user.login' }, days),
    aggregateByDay(MovieView, {}, days),
    aggregateByDay(User, {}, days),
    aggregateByDay(ActivityLog, { action: 'vip.subscription' }, days)
  ]);

  return {
    dailyActiveUsers: dailyActive.map((r) => ({ date: r._id, count: r.count })),
    movieViewsOverTime: movieViews.map((r) => ({ date: r._id, count: r.count })),
    newRegistrations: registrations.map((r) => ({ date: r._id, count: r.count })),
    vipSubscriptions: vipSubs.map((r) => ({ date: r._id, count: r.count }))
  };
}

module.exports = { getOverview, getCharts };
