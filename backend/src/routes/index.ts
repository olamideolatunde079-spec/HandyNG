import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import usersRouter from './users';
import categoriesRouter from './categories';

const router = Router();

/**
 * Mount all v1 API routes.
 * New feature routers are added here as phases progress.
 */
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/categories', categoriesRouter);

export default router;
