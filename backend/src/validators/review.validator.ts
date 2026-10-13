import { z } from 'zod';

export const createReviewSchema = z.object({
  service_request_id: z.string().uuid('Invalid service request ID'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .max(2000, 'Comment must not exceed 2000 characters')
    .optional()
    .nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
