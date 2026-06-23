import { checkHoneypot } from "./honeypot";
import { getClientIpFromHeaders } from "./request-ip";
import { checkSubmissionTime } from "./submission-time";
import { validateTurnstile } from "./turnstile";

export const GENERIC_FORM_ERROR =
  "Unable to submit. Please check your information and try again.";

export type AntiSpamFields = {
  turnstileToken?: string;
  formLoadedAt?: unknown;
  companyName?: unknown;
};

export async function validateAntiSpam(
  fields: AntiSpamFields,
  headers: Headers
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const hp = checkHoneypot(fields.companyName);
  if (!hp.ok) return hp;

  const st = checkSubmissionTime(fields.formLoadedAt);
  if (!st.ok) return st;

  const ip = getClientIpFromHeaders(headers);
  const token = typeof fields.turnstileToken === "string" ? fields.turnstileToken : "";
  const turnstile = await validateTurnstile(token, ip);
  if (!turnstile.ok) return turnstile;

  return { ok: true };
}
