import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HRIS — Human Resource Information System',
  description: 'Manage your people, payroll, and workplace in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
