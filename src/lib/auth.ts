import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { normaliseEmail, randomToken, sha256 } from "@/lib/security";

const COOKIE = "paip_session";
const SESSION_DAYS = 7;
const GENERIC_LOGIN_ERROR = "Email or password is incorrect";

export async function createSession(userId: string) {
  const token = randomToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const requestHeaders = await headers();
  await db.session.create({ data: { tokenHash, userId, expiresAt, userAgent: requestHeaders.get("user-agent")?.slice(0, 300) } });
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt, priority: "high" });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: { include: { institution: true, organisation: true } } } });
  if (!session || session.expiresAt <= new Date() || !session.user.active || session.user.deletedAt) return null;
  return session;
}

export async function requireSession(roles?: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (roles && !roles.includes(session.user.role)) redirect("/forbidden");
  return session;
}

export async function authenticate(emailValue: string, password: string) {
  const email = normaliseEmail(emailValue);
  const keyHash = sha256(email);
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const attempts = await db.authAttempt.count({ where: { keyHash, success: false, createdAt: { gte: since } } });
  if (attempts >= 8) return { ok: false as const, error: "Too many attempts. Try again in 15 minutes." };
  const user = await db.user.findUnique({ where: { email } });
  const ok = !!user && user.active && !user.deletedAt && await verify(user.passwordHash, password).catch(() => false);
  await db.authAttempt.create({ data: { keyHash, success: ok } });
  if (!ok || !user) return { ok: false as const, error: GENERIC_LOGIN_ERROR };
  await createSession(user.id);
  await db.auditLog.create({ data: { actorId: user.id, action: "AUTH_LOGIN", entityType: "User", entityPublicId: user.publicId, outcome: "SUCCESS" } });
  return { ok: true as const, user };
}

export async function invalidateAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}
