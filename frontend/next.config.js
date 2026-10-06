/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type checking is done separately via `npm run typecheck` (tsc --noEmit).
    ignoreBuildErrors: true,
  },
  // Ensure Font Awesome packages are transpiled correctly
  transpilePackages: [
    '@fortawesome/fontawesome-svg-core',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/free-regular-svg-icons',
    '@fortawesome/react-fontawesome',
  ],
};

module.exports = nextConfig;
