"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@prisma/client";

interface AppNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    companyName?: string | null;
    role: Role;
  };
}

export function AppNav({ user }: AppNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/app" },
    { name: "Requests", href: "/app/rfqs" },
    { name: "Settings", href: "/app/settings" },
  ];

  if (user.role === Role.ADMIN) {
    navItems.push(
      { name: "Users", href: "/app/users" },
      { name: "Services", href: "/app/services" }
    );
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="bg-brand-forest text-brand-paper border-brand-green/30 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-brand-paper/10 flex flex-col gap-3 border-b py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-brand-gold text-brand-forest rounded px-2 py-0.5 text-xs font-bold tracking-wider uppercase">
              Console
            </span>
            <div className="text-sm">
              <span className="text-brand-paper font-semibold">
                {user.name || user.email}
              </span>
              {user.companyName && (
                <span className="text-brand-paper/70 font-normal">
                  {" "}
                  · {user.companyName}
                </span>
              )}
            </div>
            <span className="bg-brand-green/30 border-brand-gold/20 text-brand-gold rounded border px-2 py-0.5 font-mono text-xs">
              {user.role}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="bg-brand-paper/10 hover:bg-brand-paper/20 text-brand-paper min-h-[36px] self-start rounded px-3 py-1.5 text-xs font-semibold transition-colors sm:self-auto"
          >
            Sign out
          </button>
        </div>

        {/* Secondary Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 sm:space-x-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-brand-green text-brand-gold font-semibold"
                    : "text-brand-paper/80 hover:bg-brand-green/30 hover:text-brand-paper"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
