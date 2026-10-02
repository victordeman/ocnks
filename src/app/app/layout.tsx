import { requireAuthSession } from "@/lib/auth/session";
import { AppNav } from "./AppNav";

export default async function AppConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthSession();

  return (
    <div className="bg-brand-paper/50 flex min-h-screen flex-col">
      <AppNav
        user={{
          name: session.user.name,
          email: session.user.email,
          companyName: session.user.companyName,
          role: session.user.role,
        }}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
