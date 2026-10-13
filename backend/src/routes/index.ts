import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import usersRouter from './users';
import artisansRouter from './artisans';
import servicesRouter from './services';
import categoriesRouter from './categories';
import uploadRouter from './upload';
import requestsRouter from './requests';
import reviewsRouter from './reviews';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/artisans', artisansRouter);
router.use('/services', servicesRouter);
router.use('/categories', categoriesRouter);
router.use('/upload', uploadRouter);
router.use('/requests', requestsRouter);
router.use('/reviews', reviewsRouter);

export default router;
