import { NextResponse } from "next/server";

const CORS_ORIGIN = process.env.NEWSLETTER_CORS_ORIGIN || "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const config = {
  matcher: "/api/newsletter/:path*",
};

export function middleware(request: Request) {
  if (request.nextUrl.pathname.startsWith("/api/newsletter")) {
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
  return NextResponse.next();
}
