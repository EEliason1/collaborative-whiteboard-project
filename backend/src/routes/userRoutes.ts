import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { getProfile, addFriend } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { saveFavoriteWhiteboard, getFavoriteWhiteboards } from '../controllers/whiteboardController';

const router = Router();

router.get('/profile', authenticateToken, getProfile);

router.post(
  '/add-friend',
  authenticateToken,
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      friendId: Joi.string().required(),
    }),
  }),
  addFriend
);

router.post('/save-favorite', authenticateToken, saveFavoriteWhiteboard);
router.get('/favorites', authenticateToken, getFavoriteWhiteboards);

export default router;
