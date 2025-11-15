import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Snowboard Instructor Booking',
  description: 'Book professional snowboard and ski instructors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              🏂 SnowPro
            </a>
            <div className="flex gap-4">
              <a href="/instructors" className="hover:text-primary">
                Find Instructors
              </a>
              <a href="/login" className="hover:text-primary">
                Login
              </a>
              <a href="/register" className="hover:text-primary">
                Sign Up
              </a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
