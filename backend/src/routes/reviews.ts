import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../validators/profile.validator';
import { createReviewHandler, listReviewsHandler } from '../controllers/reviews.controller';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

// All review routes require authentication
router.use(requireAuth);

router.post('/', validate(createReviewSchema), createReviewHandler);
router.get('/', listReviewsHandler);

export default router;
