const rateLimit = require('express-rate-limit');

// General API limiter — permissive for personal use, tighten as you scale
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limiter for the voice upload endpoint (Whisper + Claude calls are expensive)
const recordLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RECORD_RATE_LIMIT_MAX || '10'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many recording requests, please slow down.' },
});

module.exports = { apiLimiter, recordLimiter };
