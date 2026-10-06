import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Prevent Font Awesome from adding its own CSS in the browser
// (since we're importing the CSS file above for SSR)
config.autoAddCss = false;

export const metadata: Metadata = {
  title: { default: 'HandyNG', template: '%s | HandyNG' },
  description:
    'HandyNG — find trusted local artisans near you. Plumbers, electricians, cleaners, tailors and more across Nigeria.',
  keywords: ['artisan', 'Nigeria', 'local services', 'handyman', 'plumber', 'electrician'],
  openGraph: {
    title: 'HandyNG',
    description: 'Find trusted local artisans near you in Nigeria',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900 bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
