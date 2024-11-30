import { server } from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    logger.info('Connected to MongoDB');
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Database connection error:', error);
    process.exit(1);
  });
