"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? role === "teacher"
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

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-[var(--primary)] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold shrink-0 tracking-tight">
            CDI IELTS
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                    ? "bg-white/20 font-bold"
                    : "hover:bg-white/10"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {!isLoading && isAuthenticated ? (
              <button
                onClick={logout}
                className="bg-white text-[var(--primary)] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm ml-3"
              >
                Logout
              </button>
            ) : !isLoading ? (
              <div className="flex items-center gap-2 ml-3">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
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
            ) : null}
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
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

        {/* Mobile menu with transition */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100 pb-4 pt-2" : "max-h-0 opacity-0"
            }`}
        >
          <div className="border-t border-white/20 pt-2 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive(link.href) ? "bg-white/20 font-bold" : "hover:bg-white/10"
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-white/20 mt-2 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
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
      </div>
    </nav>
  );
}
