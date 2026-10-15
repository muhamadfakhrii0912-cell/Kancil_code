import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KancilCode: Edukasi Berpikir Komputasional & AI Mentor',
    short_name: 'KancilCode',
    description:
      'Platform Edukasi Berpikir Komputasional SD & AI Mentor Ramah Anak berbasis Fabel Nusantara.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF7EE',
    theme_color: '#267D73',
    orientation: 'landscape-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
