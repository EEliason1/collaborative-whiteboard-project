import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errors } from 'celebrate';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import whiteboardRoutes from './routes/whiteboardRoutes';
import { errorHandler } from './middleware/errorHandler';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/whiteboard', whiteboardRoutes);

app.use(errors());

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });

  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });
});

export { app, server };
