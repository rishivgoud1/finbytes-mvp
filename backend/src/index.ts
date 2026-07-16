import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// JSON parsing
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────

app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

// ─── 404 Handler ───────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 404
  });
});

// ─── Global Error Handler ─────────────────────────────────

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 500
  });
});

// ─── Server Start ─────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Finbytes API listening on http://localhost:${PORT}`);
  console.log(`   GET  /health          — health check`);
  console.log(`   POST /auth/register   — user registration`);
  console.log(`   POST /auth/login      — user authentication`);
  console.log(`   GET  /auth/profile    — fetch user profile (auth required)`);
  console.log(`   GET  /articles        — article feed (auth required)`);
  console.log(`   GET  /articles/:id    — article detail (auth required)`);
});