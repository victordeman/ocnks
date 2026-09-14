import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OCNKS GLOBAL LTD — Superior Technical Services",
    template: "%s | OCNKS GLOBAL LTD",
  },
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
