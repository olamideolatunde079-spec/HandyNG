import { z } from 'zod';

export const createServiceSchema = z.object({
  category_id: z.string().uuid('Must be a valid category ID'),
  name: z.string().min(2, 'Service name is required').max(150),
  description: z.string().max(1000).optional().nullable(),
  price_from: z.number().min(0).optional().nullable(),
  price_to: z.number().min(0).optional().nullable(),
  pricing_type: z
    .enum(['fixed', 'starting_from', 'negotiable', 'inspection_required'])
    .default('negotiable'),
  is_active: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial().omit({ category_id: true });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
