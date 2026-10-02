import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/health
 * Simple liveness check — no auth required.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'HandyNG API is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'] ?? 'development',
    },
  });
});

export default router;
