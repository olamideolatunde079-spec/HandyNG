import { env } from './config/env';
import express from 'express';
import { corsMiddleware, helmetMiddleware, globalRateLimiter } from './middleware/security';
import { requestLogger } from './middleware/logger';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';

const app = express();

// ── Security middleware ────────────────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(globalRateLimiter);

// ── Body parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Request logging (dev only) ─────────────────────────────────
app.use(requestLogger);

// ── API routes ─────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── 404 & error handling (must be last) ───────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
app.listen(env.port, () => {
  console.log(`HandyNG API running on port ${env.port} [${env.nodeEnv}]`);
});

export default app;
