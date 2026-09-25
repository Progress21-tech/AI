import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aibusinessdiscoveryfor.vercel.app'),
  title: 'ProbeTech | AI Automation, Chatbots & Custom Software',
  description: 'ProbeTech designs AI automations, chatbots, and custom software for growing businesses.',
  openGraph: {
    siteName: 'ProbeTech',
    locale: 'en_NG',
    type: 'website',
  },
  icons: { icon: '/probetech-mark.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
