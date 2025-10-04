import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';
import path from 'path';


dotenv.config();


import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';


const app = express();
const PORT = process.env.PORT || 3000;


export const prisma = new PrismaClient();


app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;