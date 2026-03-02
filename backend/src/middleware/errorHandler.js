const logger = require('./logger');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error('Request error', {
    status,
    message,
    method: req.method,
    url: req.url,
    stack: err.stack,
  });

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
