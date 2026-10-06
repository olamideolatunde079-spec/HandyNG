import { z } from 'zod';

export const serviceAreaSchema = z.object({
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  area: z.string().max(150).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  radius_km: z.number().int().min(1).max(500).optional().nullable(),
});

export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;
