require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query, runMigrations } = require('./services/db');
const { UserRepository } = require('./repositories/user.repository');
const { MealRepository } = require('./repositories/meal.repository');
const { MealService } = require('./services/meal.service');
const { createUserRouter } = require('./routes/users');
const { createMealRouter } = require('./routes/meals');
const { createAuthRouter }  = require('./routes/auth');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requireAuth } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — explicit origin list for security; extend via env var as you add frontends
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — used by Railway, load balancers, and future k8s probes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Rate limit all API routes
app.use('/api', apiLimiter);

// Dependency injection — instantiate repos and services, then pass into route factories
const userRepository = new UserRepository(query);
const mealRepository = new MealRepository(query);
const mealService    = new MealService(mealRepository);

// Public auth routes (no token required)
app.use('/api/v1/auth', createAuthRouter(userRepository));

// Protected routes — require valid JWT
app.use('/api/v1/users', requireAuth, createUserRouter(userRepository));
app.use('/api/v1/meals', requireAuth, createMealRouter(mealService, mealRepository));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use(errorHandler);

async function start() {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      logger.info(`Backend running on port ${PORT}`, { env: process.env.NODE_ENV || 'development' });
    });
  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }
}

start();
