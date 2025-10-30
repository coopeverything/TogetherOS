/**
 * Root Layout for TogetherOS
 *
 * This is the top-level layout that wraps all pages in the application.
 */

import './globals.css';
import { DarkModeProvider } from '@/components/dark-mode-provider';
import { ToastProvider } from '@/components/ui/toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'TogetherOS',
  description: 'A cooperative operating system for collective action',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <DarkModeProvider>
          <ToastProvider>
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
