import type { NextConfig } from "next";
const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'" + (isProduction ? "" : " 'unsafe-eval'") + "; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'" + (isProduction ? "" : " ws:") + "; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
];
const nextConfig: NextConfig = { reactCompiler: true, poweredByHeader: false, allowedDevOrigins: ["127.0.0.1"], turbopack: { root: process.cwd() }, async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; } };
export default nextConfig;
