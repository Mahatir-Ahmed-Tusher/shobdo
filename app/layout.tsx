import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shobdo | শব্দ - Bijoy to Unicode Converter',
  description: 'Convert Bengali text between legacy Bijoy/ANSI and modern Unicode encoding instantly, securely, and completely offline.',
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
