/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    
    // This is required for static exports to work with the App Router.
    // It disables image optimization, which requires a server.
    // You can use a cloud provider for images if needed.
    images: {
    unoptimized: true,
    },
};

module.exports = nextConfig;