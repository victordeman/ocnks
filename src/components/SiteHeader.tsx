"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <header className="sticky top-0 z-50 bg-brand-forest text-brand-paper shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3 font-semibold tracking-wider hover:opacity-95 transition-opacity focus-visible:outline-white"
        >
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded bg-brand-green flex items-center justify-center font-bold text-brand-gold text-sm shadow-sm border border-brand-gold/30"
          >
            OG
          </div>
          <span className="text-lg text-brand-paper font-bold tracking-tight">
            OCNKS GLOBAL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-brand-gold ${
                  isActive ? "text-brand-gold underline underline-offset-4" : "text-brand-paper/90"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <Link
            href="/quote"
            className="bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-semibold px-4 py-2 rounded text-sm transition-colors border border-brand-gold/40 shadow-sm"
          >
            Request a quotation
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center">
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={toggleMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="p-2 rounded-md text-brand-paper hover:text-brand-gold hover:bg-brand-green/30 focus:outline-none"
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-brand-paper/10 bg-brand-forest">
          <div className="px-4 pt-3 pb-6 space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-brand-green/40 text-brand-gold"
                      : "text-brand-paper hover:bg-brand-green/20 hover:text-brand-gold"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/quote"
                onClick={closeMenu}
                className="block text-center bg-brand-gold text-brand-forest hover:bg-brand-gold/90 font-semibold px-4 py-2.5 rounded text-base transition-colors border border-brand-gold/40 shadow-sm"
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
