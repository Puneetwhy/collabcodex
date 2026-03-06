// backend/src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack || err.message}`);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    // Optional: add error code or type if needed
    error: err.name || 'Error',
  });
};

module.exports = errorHandler;