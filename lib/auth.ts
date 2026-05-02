import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "dolphin_admin_session";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return session || null;
}

export async function isAdminLoggedIn() {
  const session = await getAdminSession();

  return Boolean(session);
}