const dashboardService = require('../services/dashboardService');

exports.getOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverview();
    res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 14));
    const charts = await dashboardService.getCharts(days);
    res.json({ days, charts });
  } catch (e) {
    next(e);
  }
};
