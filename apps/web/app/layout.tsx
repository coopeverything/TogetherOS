/**
 * Root Layout for CoopEverything
 *
 * This is the top-level layout that wraps all pages in the application.
 */

import './globals.css';
import { DarkModeProvider } from '@/components/dark-mode-provider';
import { DensityProvider } from '@/components/density-provider';
import { ToastProvider } from '@/components/ui/toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CookieConsent } from '@/components/security/CookieConsent';

export const metadata = {
  title: 'CoopEverything',
  description: 'A cooperative project helping people work together to improve their lives and communities',
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
          <DensityProvider>
            <ToastProvider>
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsent />
            </ToastProvider>
          </DensityProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
