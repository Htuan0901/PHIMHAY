// Entry point dành riêng cho Vercel Serverless Function
// File này import app từ server nhưng KHÔNG chạy app.listen()
const app = require('../server/src/app');

// Vercel sẽ tự động xử lý request/response qua instance này
module.exports = app;