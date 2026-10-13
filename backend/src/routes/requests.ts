import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../validators/profile.validator';
import {
  createRequestHandler,
  listRequestsHandler,
  getRequestHandler,
  updateRequestHandler,
} from '../controllers/requests.controller';
import { createRequestSchema, updateRequestStatusSchema } from '../validators/request.validator';

const router = Router();

// All service requests routes require authentication
router.use(requireAuth);

router.post('/', validate(createRequestSchema), createRequestHandler);
router.get('/', listRequestsHandler);
router.get('/:id', getRequestHandler);
router.patch('/:id', validate(updateRequestStatusSchema), updateRequestHandler);

export default router;
