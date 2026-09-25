import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'HRIS — Human Resource Information System',
  description: 'Manage your people, payroll, and workplace in one place.',
};

/**
 * Applies the persisted theme before first paint so dark-mode users never see a
 * light flash. Must stay inline (not an external script) and must be sync.
 */
const themeBootstrap = `(function(){try{var k='hris-theme';var s=localStorage.getItem(k);var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var t=(s==='dark'||s==='light')?s:m;var r=document.documentElement;r.setAttribute('data-theme',t);r.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
