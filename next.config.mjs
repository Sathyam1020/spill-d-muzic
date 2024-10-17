/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    images: {
        domains: ['images.unsplash.com','i.ytimg.com', 'cdn.pixabay.com'],
    },
    eslint: {
        ignoreDuringBuilds: true
    } , 
    typescript: {
        // Warning: This allows production builds to successfully complete even if
        // your project has type errors.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
