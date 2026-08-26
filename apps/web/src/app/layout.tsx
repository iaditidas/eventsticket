import './globals.css';
import Providers from '../components/Providers';
import Navbar from '../components/Navbar';
import { ReactNode } from 'react';

export const metadata = {
  title: 'EventHub — Premium Event Ticketing Platform',
  description: 'Book tickets for top technology conferences, music festivals, and design summits.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
          <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
            © 2026 EventHub SaaS Platform. Built with Next.js, Express & Prisma.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
