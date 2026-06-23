import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/form-protection/rate-limit";
import { getClientIp } from "@/lib/form-protection/request-ip";

const CORS_ORIGIN = process.env.NEWSLETTER_CORS_ORIGIN || "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

const RATE_LIMITED_ROUTES: Record<string, string> = {
  "/api/contact": "contact",
  "/api/volunteer": "volunteer",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/newsletter")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }
    const response = NextResponse.next();
    Object.entries(corsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const routeKey = RATE_LIMITED_ROUTES[pathname];
  if (routeKey && request.method === "POST") {
    const ip = getClientIp(request);
    const { success } = await checkRateLimit(`${routeKey}:${ip}`);
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many attempts from this network. Please try again in an hour.",
        },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/newsletter/:path*", "/api/contact", "/api/volunteer"],
};
