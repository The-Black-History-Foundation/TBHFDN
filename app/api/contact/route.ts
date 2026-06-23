import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { GENERIC_FORM_ERROR, validateAntiSpam } from "@/lib/form-protection/validate";

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFICATION_EMAILS = [
  "info@theblackhistoryfoundation.org",
  "BoardofDirectors@theblackhistoryfoundation.org",
];

const BodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().min(1).max(320),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
  turnstileToken: z.string().min(1).max(5000),
  formLoadedAt: z.union([z.number(), z.string()]),
  companyName: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: GENERIC_FORM_ERROR }, { status: 400 });
    }

    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_FORM_ERROR }, { status: 400 });
    }

    const p = parsed.data;
    const spam = await validateAntiSpam(
      {
        turnstileToken: p.turnstileToken,
        formLoadedAt: p.formLoadedAt,
        companyName: p.companyName,
      },
      request.headers
    );
    if (!spam.ok) {
      console.warn("[contact] spam check failed:", spam.reason);
      return NextResponse.json({ error: GENERIC_FORM_ERROR }, { status: 400 });
    }

    const name = p.name.trim();
    const email = p.email.trim();
    const phone = typeof p.phone === "string" ? p.phone.trim() : "";
    const subject = p.subject.trim();
    const message = p.message.trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      console.error("Firebase Admin not configured");
      return NextResponse.json(
        { error: "Message submission is temporarily unavailable." },
        { status: 503 }
      );
    }

    await db.collection("contactMessages").add({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      submittedAt: FieldValue.serverTimestamp(),
      status: "pending",
    });

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "The Black History Foundation <onboarding@resend.dev>";

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }
    if (!apiKey.startsWith("re_")) {
      console.error("RESEND_API_KEY appears invalid (Resend keys start with re_)");
      return NextResponse.json(
        {
          error:
            "Invalid Resend API key. Get a valid key from https://resend.com/api-keys",
        },
        { status: 500 }
      );
    }

    const adminSubject = `New Contact Form Message: ${subject} - From ${name}`;
    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Message</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">New Contact Form Message Received</h2>
  <p>A new message has been submitted through the TBHF website contact form.</p>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a1a2e;">Contact Details</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
    <p><strong>Subject:</strong> ${subject}</p>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1a1a2e;">Message</h3>
    <p style="white-space: pre-wrap;">${message}</p>
  </div>

  <p style="margin-top: 30px; font-size: 12px; color: #666;">
    This message was submitted via the contact form at The Black History Foundation.
  </p>
</body>
</html>
`;

    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: NOTIFICATION_EMAILS,
      subject: adminSubject,
      html: adminHtml,
    });

    if (adminResult.error) {
      console.error("Resend admin email error:", adminResult.error);
      return NextResponse.json(
        {
          error: "Failed to send notification",
          details: adminResult.error.message,
        },
        { status: 500 }
      );
    }

    const confirmSubject =
      "We Received Your Message – The Black History Foundation";
    const confirmHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">Thank You for Reaching Out</h2>
  
  <p>Dear ${name},</p>
  
  <p>Thank you for contacting The Black History Foundation. We have received your message and appreciate you taking the time to connect with us.</p>

  <p><strong>What happens next?</strong></p>
  <p>Our team will review your message and respond within 1–2 business days. We look forward to connecting with you.</p>

  <p>If you have any urgent questions, please don't hesitate to call us at (661) 524-6674.</p>

  <p style="margin-top: 30px;">
    With gratitude,<br>
    <strong>The Black History Foundation Team</strong>
  </p>
</body>
</html>
`;

    const confirmResult = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: confirmSubject,
      html: confirmHtml,
    });

    if (confirmResult.error) {
      console.error("Resend confirmation email error:", confirmResult.error);
      return NextResponse.json(
        {
          error: "Failed to send confirmation email",
          details: confirmResult.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    return NextResponse.json(
      { error: "Failed to send notification emails" },
      { status: 500 }
    );
  }
}
