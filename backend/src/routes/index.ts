import { Router } from 'express';
import healthRouter from './health';

const router = Router();

/**
 * Mount all v1 routes here.
 * Each feature gets its own router file added below as phases progress.
 */
router.use('/health', healthRouter);

export default router;
