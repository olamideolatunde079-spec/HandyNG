import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import usersRouter from './users';
import artisansRouter from './artisans';
import categoriesRouter from './categories';
import uploadRouter from './upload';

const router = Router();

/**
 * Mount all v1 API routes.
 * New feature routers are added here as phases progress.
 */
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/artisans', artisansRouter);
router.use('/categories', categoriesRouter);
router.use('/upload', uploadRouter);

export default router;
