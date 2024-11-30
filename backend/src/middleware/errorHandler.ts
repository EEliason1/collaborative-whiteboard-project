import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';
import { logger } from '../logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isCelebrateError(err)) {
    const errorBody = err.details.get('body') || err.details.get('params');
    const errorMessage = errorBody?.details[0].message || 'Validation error';
    return res.status(400).json({ message: errorMessage });
  }

  logger.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
