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
    <div className="bg-brand-forest text-brand-paper border-b border-brand-green/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-3 border-b border-brand-paper/10">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider bg-brand-gold text-brand-forest font-bold px-2 py-0.5 rounded">
              Console
            </span>
            <div className="text-sm">
              <span className="font-semibold text-brand-paper">{user.name || user.email}</span>
              {user.companyName && (
                <span className="text-brand-paper/70 font-normal"> · {user.companyName}</span>
              )}
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-green/30 border border-brand-gold/20 text-brand-gold">
              {user.role}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 bg-brand-paper/10 hover:bg-brand-paper/20 text-brand-paper rounded transition-colors min-h-[36px]"
          >
            Sign out
          </button>
        </div>

        {/* Secondary Navigation */}
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors min-h-[44px] flex items-center ${
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
