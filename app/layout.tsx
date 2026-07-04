import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shobdo | শব্দ - Bijoy to Unicode Bengali Converter & AI Proofreader',
  description: 'Convert Bengali text and .docx documents between legacy Bijoy and modern Unicode encoding instantly, securely, and completely offline. Features AI-powered proofreading.',
  keywords: ['Bijoy to Unicode', 'Unicode to Bijoy', 'Bengali Converter', 'Bangla Converter', 'Shobdo', 'শব্দ', 'Docx Converter', 'AI Proofreader', 'Bengali Spellcheck'],
  authors: [{ name: 'Mahatir Ahmed Tusher', url: 'https://github.com/Mahatir-Ahmed-Tusher' }],
  creator: 'Mahatir Ahmed Tusher',
  publisher: 'Shobdo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Shobdo | শব্দ - Bijoy ⇄ Unicode Converter & AI Proofreader',
    description: 'Blazing-fast, 100% in-browser Bijoy to Unicode Bengali converter with AI-powered proofreading. Convert .docx files securely without uploading.',
    url: 'https://shobdo-doc.vercel.app/',
    siteName: 'Shobdo',
    images: [
      {
        url: 'https://i.postimg.cc/dtL8yZYP/shobdo-logo.webp',
        width: 800,
        height: 600,
        alt: 'Shobdo Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shobdo | শব্দ - Bengali Document Converter & AI',
    description: 'Secure, offline Bijoy ⇄ Unicode converter for text and .docx with AI spellcheck.',
    images: ['https://i.postimg.cc/dtL8yZYP/shobdo-logo.webp'],
    creator: '@MahatirAhmedTusher',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
