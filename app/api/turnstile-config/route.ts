import { NextResponse } from "next/server";

/** Public Turnstile site key — safe in source; domain-restricted in Cloudflare. */
const DEFAULT_TURNSTILE_SITE_KEY = "0x4AAAAAADI9qnRwg_GGeAO4";

export async function GET() {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    process.env.TURNSTILE_SITE_KEY?.trim() ||
    DEFAULT_TURNSTILE_SITE_KEY;

  return NextResponse.json({ siteKey });
}
