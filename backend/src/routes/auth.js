const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { z }   = require('zod');
const { JWT_SECRET } = require('../middleware/auth');
const logger  = require('../middleware/logger');

const registerSchema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' },
  );
}

function createAuthRouter(userRepository) {
  const router = express.Router();

  // POST /api/v1/auth/register
  router.post('/register', async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const { name, email, password } = parsed.data;

      const existing = await userRepository.findByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const password_hash = await bcrypt.hash(password, 12);
      const user = await userRepository.create({ name, email, password_hash });
      const token = signToken(user);

      logger.info('User registered', { userId: user.id });
      res.status(201).json({ token, user: sanitize(user) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/auth/login
  router.post('/login', async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const { email, password } = parsed.data;

      const user = await userRepository.findByEmail(email);
      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = signToken(user);
      logger.info('User logged in', { userId: user.id });
      res.json({ token, user: sanitize(user) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// Strip password_hash from API responses
function sanitize(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { createAuthRouter };
