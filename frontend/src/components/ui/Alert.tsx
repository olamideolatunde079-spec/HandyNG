import { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'info' | 'warning';

// Support both 'variant' (new) and 'type' (legacy alias) patterns
interface AlertProps {
  /** Preferred prop — use 'variant' */
  variant?: AlertVariant;
  /** Legacy alias for 'variant' — accepted for backward compat */
  type?: AlertVariant;
  /** Preferred prop — pass children directly */
  children?: ReactNode;
  /** Legacy alias — renders as children if children not provided */
  message?: string;
  /** Optional close handler — renders an ✕ button */
  onClose?: () => void;
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

export default function Alert({
  variant,
  type,
  children,
  message,
  onClose,
  className = '',
}: AlertProps) {
  const resolvedVariant: AlertVariant = variant ?? type ?? 'info';
  const content = children ?? message;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[resolvedVariant]} ${className}`}
    >
      <span className="mt-0.5 font-bold shrink-0" aria-hidden="true">
        {icons[resolvedVariant]}
      </span>
      <span className="flex-1">{content}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="ml-auto shrink-0 opacity-60 hover:opacity-100 transition font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
}
