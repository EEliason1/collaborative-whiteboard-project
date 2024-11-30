import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { signup, login, logout } from '../controllers/authController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/signup',
  rateLimiter,
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  signup
);

router.post(
  '/login',
  rateLimiter,
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  login
);

router.post('/logout', logout);

export default router;
