/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  reactStrictMode: true, // helps with debugging, optional
  experimental: {
    scrollRestoration: true, // optional, improves UX
    // turboMode: true, // enable if using Next.js 14+ for faster refresh (uncomment if supported)
  },
  productionBrowserSourceMaps: false, // disables source maps in production for faster builds
  typescript: {
    ignoreBuildErrors: true, // speeds up dev if you have many TS errors (optional)
  },
  images:{
    // domains: ['https://petpoojaadmin.siswebapp.com'], // allow images from this domain
    unoptimized: true, // disable image optimization for faster builds (optional)
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;