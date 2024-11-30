// src/routes/whiteboardRoutes.ts

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  saveWhiteboard,
  getWhiteboards,
  getWhiteboardById,
  saveFavoriteWhiteboard,
  getFavoriteWhiteboards,
} from '../controllers/whiteboardController';

const router = Router();

// Save a new whiteboard
router.post('/save', authenticateToken, saveWhiteboard);

// Get all whiteboards for the authenticated user
router.get('/', authenticateToken, getWhiteboards);

// Get a specific whiteboard by ID
router.get('/:id', authenticateToken, getWhiteboardById);

// Save a whiteboard to user's favorites
router.post('/save-favorite', authenticateToken, saveFavoriteWhiteboard);

// Get user's favorite whiteboards
router.get('/favorites', authenticateToken, getFavoriteWhiteboards);

// ... any additional routes

export default router;
