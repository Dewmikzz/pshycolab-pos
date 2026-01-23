import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Psycho Lab POS',
        short_name: 'POS',
        description: 'Psycho Lab Restaurant POS System',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        orientation: 'landscape',
        icons: [
            {
                src: '/web-app-manifest-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/web-app-manifest-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
