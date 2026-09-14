import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCNKS GLOBAL LTD",
  description:
    "Superior professional technical services — supplies, procurement, and engineering for oil & gas, utilities, industrial operations, and the built environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-paper text-brand-forest antialiased">
        <header className="border-b border-brand-forest/10 bg-brand-forest text-brand-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 font-semibold tracking-wider hover:opacity-90 transition-opacity"
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
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-brand-forest/10 bg-brand-forest text-brand-paper/80 text-sm py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>
              &copy; {new Date().getFullYear()} OCNKS GLOBAL LTD. All rights
              reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
