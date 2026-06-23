import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { GENERIC_FORM_ERROR, validateAntiSpam } from "@/lib/form-protection/validate";

const resend = new Resend(process.env.RESEND_API_KEY);

const VOLUNTEER_AREAS: Record<string, string> = {
  research: "Research & Archiving",
  education: "Education & Curriculum",
  outreach: "Community Outreach",
  events: "Events & Fundraising",
  digital: "Digital Content Creation",
  tech: "Technology & Development",
};

const BodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().min(1).max(320),
  phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
  city: z.string().min(1).max(200),
  state: z.string().min(1).max(100),
  interests: z.array(z.string()).min(1).max(20),
  experience: z.union([z.string(), z.null(), z.undefined()]).optional(),
  availability: z.string().min(1).max(500),
  motivation: z.string().min(1).max(10000),
  referral: z.union([z.string(), z.null(), z.undefined()]).optional(),
  positionId: z.union([z.string(), z.null(), z.undefined()]).optional(),
  positionTitle: z.union([z.string(), z.null(), z.undefined()]).optional(),
  turnstileToken: z.string().min(1).max(5000),
  formLoadedAt: z.union([z.number(), z.string()]),
  companyName: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

function formatInterests(interests: string[]): string {
  return interests
    .map((id) => VOLUNTEER_AREAS[id] || id)
    .filter(Boolean)
    .join(", ");
}

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
      console.warn("[volunteer] spam check failed:", spam.reason);
      return NextResponse.json({ error: GENERIC_FORM_ERROR }, { status: 400 });
    }

    const name = p.name.trim();
    const email = p.email.trim();
    const phone = typeof p.phone === "string" ? p.phone.trim() : "";
    const city = p.city.trim();
    const state = p.state.trim();
    const interests = p.interests;
    const experience = typeof p.experience === "string" ? p.experience.trim() : "";
    const availability = p.availability.trim();
    const motivation = p.motivation.trim();
    const referral = typeof p.referral === "string" ? p.referral.trim() : "";
    const positionId = typeof p.positionId === "string" ? p.positionId.trim() : "";
    const positionTitle = typeof p.positionTitle === "string" ? p.positionTitle.trim() : "";

    if (!name || !email || !city || !state || !availability || !motivation) {
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
        { error: "Application submission is temporarily unavailable." },
        { status: 503 }
      );
    }

    await db.collection("volunteerApplications").add({
      name,
      email,
      phone: phone || null,
      city,
      state,
      interests,
      experience: experience || null,
      availability,
      motivation,
      referral: referral || null,
      positionId: positionId || null,
      positionTitle: positionTitle || null,
      submittedAt: FieldValue.serverTimestamp(),
      status: "pending",
    });

    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "The Black History Foundation <onboarding@resend.dev>";

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
        { error: "Invalid Resend API key. Get a valid key from https://resend.com/api-keys" },
        { status: 500 }
      );
    }

    if (adminEmails.length === 0) {
      console.error("ADMIN_EMAIL is not configured");
      return NextResponse.json(
        { error: "Admin email is not configured" },
        { status: 500 }
      );
    }

    const interestsLabel = formatInterests(interests);

    const adminSubject = `New Volunteer Application: ${name}`;
    const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Volunteer Application</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">New Volunteer Application Received</h2>
  <p>A new volunteer has submitted an application through the TBHF website.</p>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a1a2e;">Applicant Details</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
    <p><strong>Location:</strong> ${city}, ${state}</p>
    ${positionTitle ? `<p><strong>Position:</strong> ${positionTitle}</p>` : ""}
    <p><strong>Areas of Interest:</strong> ${interestsLabel}</p>
    <p><strong>Availability:</strong> ${availability}</p>
    ${referral ? `<p><strong>How they heard about us:</strong> ${referral}</p>` : ""}
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1a1a2e;">Relevant Experience</h3>
    <p style="white-space: pre-wrap;">${experience || "Not provided"}</p>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #1a1a2e;">Why They Want to Volunteer</h3>
    <p style="white-space: pre-wrap;">${motivation}</p>
  </div>

  <p style="margin-top: 30px; font-size: 12px; color: #666;">
    This application was submitted via the volunteer form at The Black History Foundation.
  </p>
</body>
</html>
`;

    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmails,
      subject: adminSubject,
      html: adminHtml,
    });

    if (adminResult.error) {
      console.error("Resend admin email error:", adminResult.error);
      return NextResponse.json(
        { error: "Failed to send admin notification", details: adminResult.error.message },
        { status: 500 }
      );
    }

    const volunteerSubject = "Thank You for Your Volunteer Application – The Black History Foundation";
    const volunteerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Volunteer Application Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a2e;">Thank You for Applying to Volunteer</h2>
  
  <p>Dear ${name},</p>
  
  <p>Thank you for your interest in volunteering with The Black History Foundation. We have received your application and appreciate your commitment to our mission of preserving and sharing Black history.</p>

  <p><strong>What happens next?</strong></p>
  <p>Our volunteer coordinator will review your application and contact you within 3–5 business days. We look forward to the possibility of working with you.</p>

  <p>If you have any questions in the meantime, please don't hesitate to reach out to us.</p>

  <p style="margin-top: 30px;">
    With gratitude,<br>
    <strong>The Black History Foundation Team</strong>
  </p>
</body>
</html>
`;

    const volunteerResult = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: volunteerSubject,
      html: volunteerHtml,
    });

    if (volunteerResult.error) {
      console.error("Resend volunteer email error:", volunteerResult.error);
      return NextResponse.json(
        { error: "Failed to send volunteer confirmation", details: volunteerResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Volunteer email error:", error);
    return NextResponse.json(
      { error: "Failed to send notification emails" },
      { status: 500 }
    );
  }
}
