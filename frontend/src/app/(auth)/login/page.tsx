'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// ── Types ──────────────────────────────────────────────────────

interface FormFields {
  email: string;
  password: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

// ── Validation ─────────────────────────────────────────────────

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!fields.password) errors.password = 'Password is required';
  return errors;
}

// ── Inner form — uses useSearchParams, must be inside Suspense ──

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const justRegistered = searchParams.get('registered') === '1';
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  const [fields, setFields] = useState<FormFields>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(key: keyof FormFields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');

    const fieldErrors = validate(fields);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn(fields.email, fields.password);

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setApiError('Please confirm your email before logging in. Check your inbox.');
        } else if (
          error.message.toLowerCase().includes('invalid login') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          setApiError('Incorrect email or password. Please try again.');
        } else {
          setApiError(error.message);
        }
        return;
      }

      // After signIn, AuthContext updates profile via onAuthStateChange.
      // Read the role from user_metadata for the immediate redirect.
      router.push(redirectTo);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-emerald-600 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>

      {justRegistered && (
        <Alert variant="success" className="mb-5">
          Account created! Check your email to confirm your address, then log in.
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {apiError && <Alert variant="error">{apiError}</Alert>}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={fields.email}
          onChange={set('email')}
          error={errors.email}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-emerald-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={fields.password}
            onChange={set('password')}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={!!errors.password}
            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 transition
              ${
                errors.password
                  ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 bg-gray-50 focus:border-emerald-400 focus:bg-white focus:ring-emerald-100'
              }`}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <Button type="submit" loading={submitting} size="lg" className="mt-2 w-full">
          Log in
        </Button>
      </form>
    </div>
  );
}

// ── Page — wraps LoginForm in Suspense (required for useSearchParams) ──

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 flex justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
