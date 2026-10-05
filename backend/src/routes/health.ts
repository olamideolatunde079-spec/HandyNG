import { Router, Request, Response } from 'express';
import { checkDbConnection } from '../utils/db';
import { sendSuccess } from '../types/api';

const router = Router();

/**
 * GET /api/v1/health
 * Liveness + readiness check. No auth required.
 * Reports API status and database connectivity.
 */
router.get('/', async (_req: Request, res: Response) => {
  const db = await checkDbConnection();

  sendSuccess(
    res,
    {
      api: 'ok',
      database: db.ok ? 'ok' : 'unreachable',
      dbLatencyMs: db.latencyMs,
      environment: process.env['NODE_ENV'] ?? 'development',
      timestamp: new Date().toISOString(),
    },
    'HandyNG API is running'
  );
});

export default router;
