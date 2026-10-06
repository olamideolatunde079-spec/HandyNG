'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

// ── Types ──────────────────────────────────────────────────────

interface FormFields {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

// ── Validation ─────────────────────────────────────────────────

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  if (!fields.first_name.trim()) errors.first_name = 'First name is required';
  if (!fields.last_name.trim()) errors.last_name = 'Last name is required';

  if (!fields.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!fields.password) {
    errors.password = 'Password is required';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = 'Password must contain at least one number';
  }

  if (!fields.confirm_password) {
    errors.confirm_password = 'Please confirm your password';
  } else if (fields.confirm_password !== fields.password) {
    errors.confirm_password = 'Passwords do not match';
  }

  return errors;
}

// ── Page ───────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [role, setRole] = useState<UserRole>('customer');
  const [fields, setFields] = useState<FormFields>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
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
      const { error } = await signUp(fields.email, fields.password, {
        first_name: fields.first_name,
        last_name: fields.last_name,
        role,
      });

      if (error) {
        setApiError(error.message);
        return;
      }

      setSuccess(true);
      // Redirect after a moment so user sees confirmation message
      setTimeout(() => router.push('/login?registered=1'), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✓
        </span>
        <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          We sent a confirmation link to{' '}
          <span className="font-medium text-gray-700">{fields.email}</span>. Click it to activate
          your account.
        </p>
        <p className="mt-4 text-xs text-gray-400">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Already have one?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {/* Role selector */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-700">I want to…</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: 'customer', label: 'Find artisans', desc: 'Book skilled services' },
              { value: 'artisan', label: 'Offer services', desc: 'Grow my business' },
            ] as { value: UserRole; label: string; desc: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              aria-pressed={role === opt.value}
              className={`rounded-xl border-2 p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                role === opt.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-200'
              }`}
            >
              <span className="block text-sm font-semibold text-gray-900">{opt.label}</span>
              <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {apiError && <Alert variant="error">{apiError}</Alert>}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            type="text"
            autoComplete="given-name"
            required
            value={fields.first_name}
            onChange={set('first_name')}
            error={errors.first_name}
          />
          <Input
            label="Last name"
            type="text"
            autoComplete="family-name"
            required
            value={fields.last_name}
            onChange={set('last_name')}
            error={errors.last_name}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={fields.email}
          onChange={set('email')}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={fields.password}
          onChange={set('password')}
          error={errors.password}
          hint="Min 8 characters, one uppercase letter, one number"
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={fields.confirm_password}
          onChange={set('confirm_password')}
          error={errors.confirm_password}
        />

        <Button type="submit" loading={submitting} size="lg" className="mt-2 w-full">
          {role === 'artisan' ? 'Create artisan account' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        By signing up you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gray-600">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-gray-600">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
