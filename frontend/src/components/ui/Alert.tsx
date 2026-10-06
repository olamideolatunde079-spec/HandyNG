import { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
};

const icons: Record<AlertVariant, string> = {
  error: '✕',
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
};

export default function Alert({ variant, children, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]} ${className}`}
    >
      <span className="mt-0.5 font-bold shrink-0" aria-hidden="true">
        {icons[variant]}
      </span>
      <span>{children}</span>
    </div>
  );
}
