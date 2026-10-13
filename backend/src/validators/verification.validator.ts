import { z } from 'zod';

export const submitVerificationSchema = z.object({
  document_type: z
    .string()
    .min(2, 'Document type is required')
    .max(100, 'Document type is too long'),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;

export const reviewVerificationSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  admin_notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional().nullable(),
});

export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>;
