import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'HRIS — Human Resource Information System',
  description: 'Manage your people, payroll, and workplace in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
