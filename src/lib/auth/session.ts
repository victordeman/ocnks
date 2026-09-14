import "server-only";
import { auth } from "@/auth";
import { Role, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

export async function getCurrentSession(): Promise<Session | null> {
  return await auth();
}

export async function requireAuthSession(): Promise<Session> {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Centralized Prisma query filter for RFQs based on session role.
 * CLIENT users see only RFQs where rfq.clientUserId === session.user.id OR rfq.email === session.user.email.
 * STAFF and ADMIN users see all RFQs.
 */
export function rfqWhereForRole(session: Session | null): Prisma.RfqWhereInput {
  if (!session || !session.user) {
    return { id: "unauthorized_no_access" };
  }

  const role = session.user.role;
  const userId = session.user.id;
  const userEmail = session.user.email ? session.user.email.toLowerCase() : "";

  if (role === Role.CLIENT) {
    return {
      OR: [
        { clientUserId: userId },
        { email: { equals: userEmail, mode: "insensitive" } },
      ],
    };
  }

  if (role === Role.STAFF || role === Role.ADMIN) {
    return {};
  }

  return { id: "unauthorized_no_access" };
}
