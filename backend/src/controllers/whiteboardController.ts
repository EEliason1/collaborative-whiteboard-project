// src/controllers/whiteboardController.ts

import { Request, Response, NextFunction } from 'express';
import { Whiteboard, IWhiteboard } from '../models/Whiteboard';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

export const saveWhiteboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, data } = req.body;

    const whiteboard = new Whiteboard({
      name,
      data,
      owner: userId,
    });

    await whiteboard.save();

    const user = await User.findById(userId);
    if (user) {
      user.savedWhiteboards.push(whiteboard._id);
      await user.save();
    } else {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(201).json({ message: 'Whiteboard saved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getWhiteboards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const whiteboards = await Whiteboard.find({ owner: userId });

    res.status(200).json(whiteboards);
  } catch (error) {
    next(error);
  }
};

export const getWhiteboardById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const whiteboardId = req.params.id;
    const userId = (req as any).user.id;

    const whiteboard = await Whiteboard.findOne({ _id: whiteboardId, owner: userId });

    if (!whiteboard) {
      res.status(404).json({ message: 'Whiteboard not found' });
      return;
    }

    res.status(200).json(whiteboard);
  } catch (error) {
    next(error);
  }
};

export const saveFavoriteWhiteboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { imageData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Save the imageData as a new favorite whiteboard
    user.favorites = user.favorites || [];
    user.favorites.push({ imageData, date: new Date() });
    await user.save();

    res.status(200).json({ message: 'Whiteboard saved to favorites' });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteWhiteboards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select('favorites');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

// ... any additional controller functions
