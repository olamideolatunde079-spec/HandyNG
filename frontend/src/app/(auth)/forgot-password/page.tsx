'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setApiError(error.message);
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          ✉
        </span>
        <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          We sent a password reset link to{' '}
          <span className="font-medium text-gray-700">{email}</span>.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setSent(false)}
            className="text-emerald-600 underline hover:text-emerald-700"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-sm font-medium text-emerald-600 hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {apiError && <Alert variant="error">{apiError}</Alert>}

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
          }}
          error={emailError}
        />

        <Button type="submit" loading={submitting} size="lg" className="mt-2 w-full">
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-medium text-emerald-600 hover:underline">
          ← Back to login
        </Link>
      </div>
    </div>
  );
}
