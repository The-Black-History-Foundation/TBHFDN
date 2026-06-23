/** Honeypot: reject if bots fill the hidden `company_name` field. */
export function checkHoneypot(
  companyName: unknown
): { ok: true } | { ok: false; reason: string } {
  if (companyName === undefined || companyName === null) return { ok: true };
  if (typeof companyName !== "string") return { ok: false, reason: "honeypot_type" };
  if (companyName.trim().length > 0) return { ok: false, reason: "honeypot_filled" };
  return { ok: true };
}
