# The Black History Foundation Website

A modern responsive website for The Black History Foundation (TBHF), a non-profit organization dedicated to preserving and promoting Black history and cultural heritage.

## Features

- Responsive design that works well on mobile, tablet, and desktop
- Interactive elements including scroll animations and hover effects
- Comprehensive information about the foundation's mission and programs
- User-friendly donation system with various payment options
- Volunteer application form and information
- Contact form for inquiries and partnership opportunities
- **Form spam protection** on contact and volunteer submissions (Cloudflare Turnstile, honeypot, timing checks, optional per-IP rate limiting)
- Admin dashboard for managing newsletter subscribers, volunteer applications, and volunteer positions (at `/admin`)

## Pages

- **Home** - Main landing page showcasing the foundation's mission and key information
- **About** - Detailed information about the foundation, team, and programs
- **Volunteer** - Information about volunteer opportunities and an application form
- **Contact** - Contact information and a contact form
- **Donate** - Donation form with various payment options

## Design System

The website follows a cohesive design system:

- **Typography**:
  - **Helvetica** - Used for body text and general content for clarity and readability
  - **Neue Kabel** - Used for headings and important text to create visual interest

- **Colors**:
  - Primary: Firebrick Red (#B22222)
  - Secondary: Gold (#FFD700)
  - Accent: Dark Green (#006400)
  - Neutrals: Varying shades of black, white, and gray

- **Visual Elements**:
  - Interactive waves background on the homepage
  - Scroll animations for content sections
  - Hover effects on interactive elements
  - Consistent spacing and layout principles

## Technology Stack

- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - For styling components
- **Framer Motion** - For animations and transitions
- **React Intersection Observer** - For scroll-based animations
- **Cloudflare Turnstile** - Bot protection on public forms
- **Upstash Redis** - Optional per-IP rate limiting on form API routes
- **Zod** - Request validation on form API routes
- **Resend** - Transactional email for form notifications and newsletter
- **Firebase** - Firestore (data), Authentication (admin), Storage (resume uploads)

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Configure Firebase (required for newsletter, volunteer forms, and admin):
   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication (Email/Password)
   - Copy `.env.example` to `.env.local` and add your Firebase config values
   - Deploy Firestore rules: `firebase deploy --only firestore:rules --project <your-project-id>`
   - Create an admin user in Authentication, then add a document to the `admins` collection with the document ID set to that user's UID

4. Configure form spam protection (required for contact and volunteer forms):
   - Create a [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) widget and add your site domains
   - Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in `.env.local` (and in Vercel for production)
   - Optionally set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for per-IP rate limiting (5 submissions per hour per route)

5. Run the development server:
```bash
pnpm dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Admin Dashboard

Access the admin dashboard at `/admin` to manage newsletter subscribers, volunteer applications, volunteer positions, contact messages, board of directors, and more. You must be logged in with an account that has a document in the Firestore `admins` collection (document ID = your user UID).

### Volunteer Management System

The admin panel includes a full volunteer management system:

- **Volunteer Positions** – Create, edit, and manage volunteer opportunity cards. Positions can be saved as drafts (not visible on the public site) or published.
- **LinkedIn Job Descriptions** – When creating a position, optionally generate an AI-powered LinkedIn-style job description. Edit the draft, save it, then copy to clipboard (with application form link) for manual posting to LinkedIn.
- **Volunteer Applications** – View applications with full recruitment tracking: resume uploads, interview scheduling, onboarding status, and extended workflow (pending → reviewed → interview_scheduled → interviewed → offered → onboarded → closed).
- **Position Selection** – The public volunteer form lets applicants choose a specific position from a dropdown; positions can be pre-selected via URL (`/volunteer?position={id}#apply`).

**Environment variables for volunteer features:**

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | For AI job descriptions | Get from [Anthropic Console](https://console.anthropic.com/) |
| `VOLUNTEER_FORM_URL` | Optional | Override the application URL in generated job descriptions (default: uses `NEXT_PUBLIC_VERCEL_URL` or production URL) |

**Resume uploads** require Firebase Storage to be enabled and the service account to have Storage Admin permissions. The storage bucket is configured via `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`.

## Form Spam Protection

Contact and volunteer submissions use layered bot protection (similar to the HelpKeepMyMoney project):

| Layer | Description |
|-------|-------------|
| **Cloudflare Turnstile** | Users complete a security check before submitting |
| **Honeypot field** | Hidden field that bots often fill; submissions with it set are rejected |
| **Minimum submit time** | Rejects submissions completed in under 4 seconds |
| **Zod validation** | Server-side schema validation on `/api/contact` and `/api/volunteer` |
| **Per-IP rate limiting** | Optional Upstash sliding window (5 POSTs per hour per route); skipped if Upstash env vars are unset |

### Submission flow

Public forms no longer write directly to Firestore from the browser. Instead:

1. The user completes the form and Turnstile check
2. The client POSTs to `/api/contact` or `/api/volunteer` with spam-protection fields
3. Middleware applies rate limiting (when Upstash is configured)
4. The API validates spam checks, saves to Firestore via Firebase Admin SDK, then sends email via Resend

Firestore rules block public `create` on `contactMessages` and `volunteerApplications`, so bots cannot bypass the API.

### Environment variables for forms

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes (forms) | Cloudflare Turnstile site key (public); also readable at runtime via `/api/turnstile-config` |
| `TURNSTILE_SITE_KEY` | Alternative | Server-only alias for the Turnstile site key if `NEXT_PUBLIC_*` is not set at build time |
| `TURNSTILE_SECRET_KEY` | Yes (forms) | Cloudflare Turnstile secret key (server only) |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST token for rate limiting |
| `RESEND_API_KEY` | Yes (forms) | Resend API key for notification emails |
| `RESEND_FROM_EMAIL` | Yes (forms) | Sender address for Resend emails |
| `ADMIN_EMAIL` | Yes (volunteer) | Comma-separated admin notification recipients |
| `FIREBASE_CLIENT_EMAIL` | Yes (forms) | Firebase service account email for server-side Firestore writes |
| `FIREBASE_PRIVATE_KEY` | Yes (forms) | Firebase service account private key |

Implementation lives in `lib/form-protection/`; middleware rate-limits `POST /api/contact` and `POST /api/volunteer`.

## Building for Production

```bash
pnpm build
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- Design inspired by modern non-profit websites
- Images from various sources (placeholder images used for demonstration)
