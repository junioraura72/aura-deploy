import type { ReactNode } from 'react';
import './globals.css';
import ArchitectAutoTrigger from './architect-auto';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ArchitectAutoTrigger />
        {children}
      </body>
    </html>
  );
}
