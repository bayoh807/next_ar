/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['maps.googleapis.com'],
  },
  safelist: [
    "bg-[url('/background.svg')]",
  ],
  basePath: "",
  output: "standalone",
  webpack: (config) => {
    config.externals = [...config.externals, 'google'];

    // Add a rule to handle .glb files
    config.module.rules.push({
      test: /\.glb$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            outputPath: 'static/models',
            publicPath: '/_next/static/models',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });

    return config;
  },
}

module.exports = nextConfig;
