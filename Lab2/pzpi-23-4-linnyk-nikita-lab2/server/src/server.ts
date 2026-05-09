import dotenv from "dotenv";
import express from 'express';
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
import { errorHandler } from "./middlewares/errorHandler.js";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());

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

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;