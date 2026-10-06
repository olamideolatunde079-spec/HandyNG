import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'Account', template: '%s | HandyNG' },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-xl font-bold text-emerald-600">
            HandyNG
          </Link>
        </div>
      </header>

      {/* Auth card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white px-4 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} HandyNG. Local artisan marketplace for Nigeria.
      </footer>
    </div>
  );
}
