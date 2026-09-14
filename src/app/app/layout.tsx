import { requireAuthSession } from "@/lib/auth/session";
import { AppNav } from "./AppNav";

export default async function AppConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthSession();

  return (
    <div className="min-h-screen bg-brand-paper/50 flex flex-col">
      <AppNav
        user={{
          name: session.user.name,
          email: session.user.email,
          companyName: session.user.companyName,
          role: session.user.role,
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
