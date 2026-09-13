import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function normaliseEmail(value: string) {
  return value.trim().toLowerCase();
}

export function sanitiseFileName(value: string) {
  return value.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}
