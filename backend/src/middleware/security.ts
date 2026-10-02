import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * CORS — only allow requests from configured origins.
 */
export const corsMiddleware = cors({
  origin: env.cors.origins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

/**
 * Helmet — sets secure HTTP response headers.
 */
export const helmetMiddleware = helmet();

/**
 * Global rate limiter — 100 requests per IP per 15 minutes.
 * Individual routes can add stricter limiters on top.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});
