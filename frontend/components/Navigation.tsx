'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';

export function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            🏂 SnowPro
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/instructors" className="hover:text-primary">
              Find Instructors
            </Link>

            {user ? (
              <>
                {user.role === 'instructor' && (
                  <Link href="/dashboard" className="hover:text-primary font-medium">
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary">
                  Login
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
