import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Luxera Provenance — Financial Evidence & Compliance Intelligence',
  description: 'Enterprise open-source Source of Wealth (SoW) compliance verification platform with deterministic rules, PII protection, and cryptographic hash-chained audit trails.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
