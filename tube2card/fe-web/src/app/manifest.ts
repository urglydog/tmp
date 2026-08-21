import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tube2Card',
    short_name: 'Tube2Card',
    description: 'Chuyển video Youtube thành thẻ ghi nhớ Flashcard, Mindmap và Trắc nghiệm bằng AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
