import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "ssa_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-change-me";
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return password === expected;
}

function sign(token: string): string {
  return crypto.createHmac("sha256", secret()).update(token).digest("hex");
}

export async function setAdminSession(): Promise<void> {
  const exp = Date.now() + MAX_AGE * 1000;
  const token = Buffer.from(JSON.stringify({ exp, role: "admin" })).toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, `${token}.${sign(token)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return false;
  const token = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (sign(token) !== sig) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    return Date.now() < exp;
  } catch {
    return false;
  }
}
