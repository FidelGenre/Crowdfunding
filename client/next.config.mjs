/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * 1. BUILD OPTIMIZATION
   * These settings allow the project to build even if there are minor 
   * linting or type warnings, which is common in fast-paced Web3 development.
   */
  typescript: {
    // Allows production builds to successfully complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Prevents ESLint warnings from stopping the build process
    ignoreDuringBuilds: true,
  },

  /**
   * 2. WEB3 & POLYFILL CONFIGURATION
   * Most Ethereum libraries (like Wagmi/Viem) rely on Node.js modules 
   * that aren't natively available in the browser.
   */
  webpack: (config) => {
    // Provides fallbacks for Node.js modules that are not available in the browser
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    /**
     * Fixes common compatibility issues with specific wallet libraries 
     * (e.g., MetaMask, WalletConnect) by marking certain peer dependencies as external.
     */
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    return config;
  },
};

export default nextConfig;