"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems = [
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Markets", href: "/markets" },
  { name: "HSE", href: "/hse" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Handle Escape key press to close menu and restore focus to trigger button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      toggleButtonRef.current?.focus();
    } else {
      setMobileMenuOpen(true);
    }
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-brand-forest text-brand-paper sticky top-0 z-50 shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3 font-semibold tracking-wider transition-opacity hover:opacity-95 focus-visible:outline-white"
        >
          <div
            aria-hidden="true"
            className="bg-brand-green text-brand-gold border-brand-gold/30 flex h-9 w-9 items-center justify-center rounded border text-sm font-bold shadow-sm"
          >
            OG
          </div>
          <span className="text-brand-paper text-lg font-bold tracking-tight">
            OCNKS GLOBAL LTD
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-brand-gold text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-gold underline underline-offset-4"
                    : "text-brand-paper/90"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {status === "authenticated" && session?.user ? (
            <Link
              href="/app"
              className="bg-brand-green/30 hover:bg-brand-green/50 text-brand-gold border-brand-gold/30 flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium transition-colors"
            >
              <span>Console</span>
              <span className="text-brand-paper/80 font-normal">
                ({session.user.name || session.user.email})
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hover:text-brand-gold text-brand-paper/90 px-3 py-2 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/quote"
            className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 border-brand-gold/40 rounded border px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
          >
            Request a quotation
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={toggleMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="text-brand-paper hover:text-brand-gold hover:bg-brand-green/30 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2.5 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-brand-paper/10 bg-brand-forest border-t md:hidden"
        >
          <div className="space-y-3 px-4 pt-3 pb-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`block rounded-md px-3 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-brand-green/40 text-brand-gold"
                      : "text-brand-paper hover:bg-brand-green/20 hover:text-brand-gold"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {status === "authenticated" && session?.user ? (
              <Link
                href="/app"
                onClick={closeMenu}
                className="bg-brand-green/30 text-brand-gold hover:bg-brand-green/40 block rounded-md px-3 py-3 text-base font-medium transition-colors"
              >
                Console ({session.user.name || session.user.email})
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="text-brand-paper hover:bg-brand-green/20 hover:text-brand-gold block rounded-md px-3 py-3 text-base font-medium transition-colors"
              >
                Sign in
              </Link>
            )}

            <div className="pt-2">
              <Link
                href="/quote"
                onClick={closeMenu}
                className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 border-brand-gold/40 block rounded border px-4 py-3 text-center text-base font-semibold shadow-sm transition-colors"
              >
                Request a quotation
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
