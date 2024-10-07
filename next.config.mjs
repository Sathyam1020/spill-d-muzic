/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    images: {
        domains: ['images.unsplash.com','i.ytimg.com'],
    },
    eslint: {
        ignoreDuringBuilds: true
    } 
};

export default nextConfig;
