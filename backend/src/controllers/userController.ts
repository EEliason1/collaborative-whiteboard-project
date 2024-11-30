import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).populate('friends').populate('savedWhiteboards');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      friends: user.friends,
      savedWhiteboards: user.savedWhiteboards,
    });
  } catch (error) {
    next(error);
  }
};

export const addFriend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { friendId } = req.body;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.friends.push(friend._id);
    await user.save();

    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    next(error);
  }
};
