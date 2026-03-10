/** @type {import('next').NextConfig} */
const nextConfig = {
    // Otimização de imagens
    images: {
        domains: ['localhost'],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },

    // Compressão
    compress: true,

    // Headers de segurança (CSP, XSS, etc.)
    async headers() {
        const cspDirectives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // unsafe-eval needed by PrimeReact
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' http://localhost:* https:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ');

        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: cspDirectives,
                    },
                ],
            },
        ];
    },

    // Transpile PrimeReact para evitar erros de SSR
    transpilePackages: ['primereact'],

    // Experimental: output standalone para Docker
    // output: 'standalone',
};

module.exports = nextConfig;
