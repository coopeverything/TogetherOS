/**
 * Root Layout for TogetherOS
 *
 * This is the top-level layout that wraps all pages in the application.
 */

import './globals.css';
import { DarkModeProvider } from '@/components/dark-mode-provider';

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
      <body>
        <DarkModeProvider>{children}</DarkModeProvider>
      </body>
    </html>
  );
}
