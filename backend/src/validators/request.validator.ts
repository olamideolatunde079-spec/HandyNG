import { z } from 'zod';

export const createRequestSchema = z.object({
  artisan_id: z.string().uuid('Invalid artisan ID'),
  service_id: z.string().uuid('Invalid service ID').optional().nullable(),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  location: z
    .string()
    .min(3, 'Location is required')
    .max(255, 'Location must not exceed 255 characters'),
  preferred_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
  preferred_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be in HH:MM format')
    .optional()
    .nullable(),
  estimated_price: z.number().min(0, 'Estimated price must be positive').optional().nullable(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

export const updateRequestStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']),
  estimated_price: z.number().min(0, 'Estimated price must be positive').optional().nullable(),
});

export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
