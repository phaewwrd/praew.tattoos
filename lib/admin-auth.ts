import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AdminSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    disabled: boolean;
  };
};

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user) {
      return null;
    }

    const role = typeof session.user.role === "string" ? session.user.role : "";
    const disabled = Boolean(session.user.disabled);

    if (disabled || role !== "admin") {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role,
        disabled,
      },
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
