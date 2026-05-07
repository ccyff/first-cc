import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s === "change-me-to-a-long-random-string-in-production") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set in production");
    }
  }
  return new TextEncoder().encode(s || "dev-insecure-secret");
}

export async function createSessionToken(adminId: string, email: string) {
  return new SignJWT({ sub: adminId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { sub?: string; email?: string };
}

export async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/admin/login?e=1");
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect("/admin/login?e=1");
  }

  const token = await createSessionToken(user.id, user.email);
  const jar = await cookies();
  jar.set("ai_nav_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function logoutAction() {
  "use server";
  const jar = await cookies();
  jar.delete("ai_nav_session");
  redirect("/admin/login");
}

export async function getSessionFromCookies() {
  const jar = await cookies();
  const token = jar.get("ai_nav_session")?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
