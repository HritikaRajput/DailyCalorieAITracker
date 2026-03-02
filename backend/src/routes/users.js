const express = require('express');
const { createUserSchema, updateUserSchema } = require('../models/user.model');
const validate = require('../middleware/validate');
const logger = require('../middleware/logger');

/**
 * @param {import('../repositories/user.repository').UserRepository} userRepository
 * @returns {express.Router}
 */
function createUserRouter(userRepository) {
  const router = express.Router();

  // POST /api/v1/users — create a user profile
  router.post('/', validate(createUserSchema), async (req, res, next) => {
    try {
      const user = await userRepository.create(req.body);
      logger.info('User created', { userId: user.id });
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/users — list all users (profile switcher)
  router.get('/', async (req, res, next) => {
    try {
      const users = await userRepository.findAll();
      res.json({ users });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/users/:id — get a user profile
  router.get('/:id', async (req, res, next) => {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/v1/users/:id — update profile
  router.put('/:id', validate(updateUserSchema), async (req, res, next) => {
    try {
      const fields = req.body;
      if (Object.keys(fields).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      const user = await userRepository.update(req.params.id, fields);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createUserRouter };
