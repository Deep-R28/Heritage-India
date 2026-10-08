/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dormant while unoptimized (below) is true — next/image skips the
    // /_next/image proxy entirely, so this allow-list is only load-bearing
    // if unoptimized is ever removed. Kept for that forward compat.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
    // Wikimedia's CDN 429s Next's built-in optimizer proxy (no browser-like
    // User-Agent on that server-side fetch); the browser fetches these
    // directly instead, which works fine.
    unoptimized: true,
  },
};

export default nextConfig;
