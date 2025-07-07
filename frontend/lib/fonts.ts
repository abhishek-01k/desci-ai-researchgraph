import localFont from 'next/font/local';

// Inter variable font configuration
export const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Variable.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Variable-Italic.woff2',
      weight: '100 900',
      style: 'italic',
    },
    {
      path: '../public/fonts/InterVariable.ttf',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/InterVariable-Italic.ttf',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Arial',
    'sans-serif',
  ],
});

// JetBrains Mono variable font configuration
export const jetbrainsMono = localFont({
  src: [
    {
      path: '../public/fonts/JetBrainsMono-Variable.ttf',
      weight: '100 800',
      style: 'normal',
    },
    {
      path: '../public/fonts/JetBrainsMono-Variable-Italic.ttf',
      weight: '100 800',
      style: 'italic',
    },
    {
      path: '../public/fonts/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/JetBrainsMono-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
}); 