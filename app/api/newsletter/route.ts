import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS_ORIGIN =
  process.env.NEWSLETTER_CORS_ORIGIN || "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const db = getAdminDb();
    if (!db) {
      console.error("Firebase Admin not configured (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable" },
        { status: 503, headers: corsHeaders() }
      );
    }

    const newsletterRef = db.collection("newsletter");
    const existingSnapshot = await newsletterRef
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      const doc = existingSnapshot.docs[0];
      const data = doc.data();
      const status = data?.status ?? "confirmed";
      return NextResponse.json(
        {
          success: true,
          alreadySubscribed: true,
          message:
            status === "confirmed"
              ? "You're already subscribed to our newsletter."
              : "Please check your inbox to confirm your subscription.",
        },
        { headers: corsHeaders() }
      );
    }

    const confirmToken = randomBytes(32).toString("hex");
    // Use TBHF-1 site URL for confirm link (not request origin - policy site calls this API)
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://tbhf-2.vercel.app";
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${confirmToken}`;

    await newsletterRef.add({
      email: normalizedEmail,
      subscribedAt: FieldValue.serverTimestamp(),
      status: "pending",
      confirmToken,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !apiKey.startsWith("re_")) {
      console.error("RESEND_API_KEY not configured for newsletter confirmation");
      return NextResponse.json(
        { error: "Newsletter signup is temporarily unavailable" },
        { status: 503, headers: corsHeaders() }
      );
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "The Black History Foundation <onboarding@resend.dev>";

    const confirmSubject =
      "Confirm Your Newsletter Subscription – The Black History Foundation";
    const confirmHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Newsletter Subscription</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">Confirm Your Subscription</h2>
  
  <p>Thank you for subscribing to The Black History Foundation newsletter.</p>
  
  <p>Please click the button below to confirm your subscription and start receiving updates on our mission to preserve Black history.</p>

  <p style="margin: 30px 0;">
    <a href="${confirmUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Confirm Subscription</a>
  </p>

  <p style="font-size: 12px; color: #666;">
    If the button doesn't work, copy and paste this link into your browser:<br>
    <a href="${confirmUrl}">${confirmUrl}</a>
  </p>

  <p style="font-size: 12px; color: #666;">
    If you didn't request this subscription, you can safely ignore this email.
  </p>

  <p style="margin-top: 30px;">
    With gratitude,<br>
    <strong>The Black History Foundation Team</strong>
  </p>
</body>
</html>
`;

    const result = await resend.emails.send({
      from: fromEmail,
      to: normalizedEmail,
      subject: confirmSubject,
      html: confirmHtml,
    });

    if (result.error) {
      console.error("Newsletter confirmation email error:", result.error);
      return NextResponse.json(
        {
          error: "Failed to send confirmation email. Please try again later.",
          details: result.error.message,
        },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Please check your inbox and click the confirmation link to complete your subscription.",
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
