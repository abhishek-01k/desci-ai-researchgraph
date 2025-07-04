import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'ResearchGraph AI - Revolutionizing Scientific Discovery',
  description: 'AI-powered knowledge graphs, research acceleration, and decentralized science platform. Transform how you discover, analyze, and collaborate on scientific research.',
  keywords: ['research', 'ai', 'knowledge graph', 'desci', 'scientific discovery', 'hypothesis generation', 'peer review'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'ResearchGraph AI - Revolutionizing Scientific Discovery',
    description: 'AI-powered knowledge graphs and research acceleration platform',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResearchGraph AI',
    description: 'Revolutionizing Scientific Discovery Through AI-Powered Knowledge Graphs',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}