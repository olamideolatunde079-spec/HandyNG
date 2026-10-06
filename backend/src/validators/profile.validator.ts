import { z } from 'zod';

// ── Reusable field schemas ─────────────────────────────────────

const nameField = z
  .string()
  .min(1, 'Required')
  .max(100, 'Too long')
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/, 'Invalid characters');

const phoneField = z
  .string()
  .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number')
  .optional()
  .nullable();

const textField = (max: number) =>
  z.string().max(max, `Must be ${max} characters or less`).optional().nullable();

// ── Customer profile update ────────────────────────────────────

export const updateProfileSchema = z.object({
  first_name: nameField.optional(),
  last_name: nameField.optional(),
  phone: phoneField,
  city: textField(100),
  state: textField(100),
  address: textField(255),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ── Artisan profile update ─────────────────────────────────────

export const updateArtisanProfileSchema = z.object({
  business_name: textField(150),
  bio: textField(1000),
  years_experience: z.number().int().min(0).max(80).optional().nullable(),
  service_radius: z
    .number()
    .int()
    .min(1, 'Must be at least 1 km')
    .max(500, 'Must be 500 km or less')
    .optional()
    .nullable(),
});

export type UpdateArtisanProfileInput = z.infer<typeof updateArtisanProfileSchema>;

// ── Validation middleware factory ──────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * Passes a 422 error to next() if validation fails.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      next({ statusCode: 422, code: 'VALIDATION_ERROR', message: messages } as unknown as Error);
      return;
    }
    // Replace body with the parsed (and coerced) data
    req.body = result.data;
    next();
  };
}
