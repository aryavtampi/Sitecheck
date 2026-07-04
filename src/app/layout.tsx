import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ViewModeWrapper } from '@/components/layout/view-mode-wrapper';
import { RealtimeProvider } from '@/components/providers/realtime-provider';
import { ErrorBoundary } from '@/components/providers/error-boundary';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SiteCheck — Stormwater Compliance Platform',
  description:
    'Drone-assisted SWPPP inspections, BMP checkpoint tracking, and regulatory reporting for construction sites.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ErrorBoundary>
          <RealtimeProvider>
            <ViewModeWrapper>{children}</ViewModeWrapper>
          </RealtimeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
