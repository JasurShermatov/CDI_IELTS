'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/login');
  };

  const navLinks = isLoggedIn
    ? userRole === 'teacher'
      ? [
          { href: '/teacher/dashboard', label: 'Dashboard' },
          { href: '/teacher/checking', label: 'Checking Queue' },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/tests', label: 'Tests' },
          { href: '/my-tests', label: 'My Tests' },
          { href: '/results', label: 'Results' },
          { href: '/speaking', label: 'Speaking' },
          { href: '/payment', label: 'Top Up' },
        ]
    : [];

  return (
    <nav className="bg-[var(--primary)] text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold">
            CDI IELTS
          </Link>

          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-gray-200 transition-colors ${
                  pathname === link.href ? 'font-bold border-b-2 border-white' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-white text-[var(--primary)] px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-gray-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-[var(--primary)] px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
