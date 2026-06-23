const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export type TurnstileValidation = { ok: true } | { ok: false; reason: string };

export async function validateTurnstile(
  token: string,
  remoteip?: string | null
): Promise<TurnstileValidation> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, reason: "turnstile_not_configured" };
  }
  const trimmed = typeof token === "string" ? token.trim() : "";
  if (!trimmed) {
    return { ok: false, reason: "turnstile_token_missing" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", trimmed);
  if (remoteip) body.set("remoteip", remoteip);

  let json: SiteverifyResponse;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    json = (await res.json()) as SiteverifyResponse;
  } catch {
    return { ok: false, reason: "turnstile_request_failed" };
  }

  if (json.success === true) return { ok: true };
  const codes = json["error-codes"]?.join(",") || "unknown";
  return { ok: false, reason: `turnstile_failed:${codes}` };
}
