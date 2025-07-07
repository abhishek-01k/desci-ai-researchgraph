/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Handle worker files and prevent Terser errors with ES modules
    config.module.rules.push(
      {
        test: /\.worker\.(js|mjs)$/,
        type: 'javascript/auto',
        use: {
          loader: 'worker-loader',
          options: {
            name: 'static/[hash].worker.js',
            publicPath: '/_next/',
          },
        },
      },
      {
        test: /HeartbeatWorker.*\.(js|mjs)$/,
        type: 'javascript/auto',
        parser: {
          javascript: {
            exportsPresence: false,
          },
        },
      }
    );

    // Configure proper module parsing for .mjs files
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Fix for ES module imports in worker files
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Configure optimization to prevent minification issues
    if (!dev) {
      config.optimization.minimizer = config.optimization.minimizer.map((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options = {
            ...minimizer.options,
            exclude: /HeartbeatWorker/,
            terserOptions: {
              ...minimizer.options.terserOptions,
              parse: {
                ...minimizer.options.terserOptions?.parse,
                ecma: 2020,
              },
              compress: {
                ...minimizer.options.terserOptions?.compress,
                // Prevent template literal breaking
                keep_fargs: false,
                pure_getters: false,
                // Don't break console statements
                drop_console: false,
                // Don't compress template literals aggressively
                collapse_vars: false,
              },
              mangle: {
                ...minimizer.options.terserOptions?.mangle,
                // Keep function names for better error messages
                keep_fnames: true,
              },
              format: {
                ...minimizer.options.terserOptions?.format,
                // Preserve quotes in template literals
                quote_style: 1,
                preserve_annotations: true,
              },
            },
          };
        }
        return minimizer;
      });
    }

    return config;
  },
};

module.exports = nextConfig;
