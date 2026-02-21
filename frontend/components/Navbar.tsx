"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    setIsLoggedIn(!!token);
    setUserRole(role);
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    setIsLoggedIn(false);
    setUserRole(null);
    setMenuOpen(false);
    router.push("/login");
  };

  const navLinks = isLoggedIn
    ? userRole === "teacher"
      ? [
          { href: "/teacher/dashboard", label: "Dashboard" },
          { href: "/teacher/checking", label: "Checking Queue" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/tests", label: "Tests" },
          { href: "/my-tests", label: "My Tests" },
          { href: "/results", label: "Results" },
          { href: "/speaking", label: "Speaking" },
          { href: "/payment", label: "Top Up" },
        ]
    : [];

  return (
    <nav className="bg-[var(--primary)] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold shrink-0">
            CDI IELTS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-gray-200 transition-colors text-sm font-medium ${
                  pathname === link.href ? "font-bold border-b-2 border-white pb-0.5" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-white text-[var(--primary)] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm ml-2"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  href="/login"
                  className="hover:text-gray-200 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-[var(--primary)] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/20 pb-4 pt-2">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    pathname === link.href ? "bg-white/20 font-bold" : "hover:bg-white/10"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/20 mt-2 pt-2">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
