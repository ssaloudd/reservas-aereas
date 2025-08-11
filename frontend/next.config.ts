const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8003/api/:path*', // Redirige todas las llamadas a la API Gateway
      },
    ];
  },
};

module.exports = nextConfig;
