import { NextResponse } from "next/server";

export async function GET() {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    process.env.TURNSTILE_SITE_KEY?.trim() ||
    "";

  return NextResponse.json({ siteKey });
}
