import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();

import authRoutes from './routes/auth.routes.js';
import passwordResetRoutes from './routes/password-reset.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import languagesRoutes from './routes/languages.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import lessonsRoutes from './routes/lessons.routes.js';
import exercisesRoutes from './routes/exercises.routes.js';
import achievementsRoutes from './routes/achievements.routes.js';
import chatRoutes from './routes/chat.routes.js';
import usersRoutes from './routes/users.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from "./middlewares/errorHandler.js";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'langbang-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'langbang-api',
    timestamp: new Date().toISOString(),
  });
});

const swaggerPath = path.join(__dirname, '../swagger.yaml');

try {
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error("Помилка завантаження Swagger:", error);
}

app.use('/api', authRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', languagesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api', lessonsRoutes);
app.use('/api', exercisesRoutes);
app.use('/api', achievementsRoutes);
app.use('/api', chatRoutes);
app.use('/api', usersRoutes);
app.use('/api', uploadRoutes);
app.use('/api', adminRoutes);

app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  const PORT = Number(process.env.PORT || 5000);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;
