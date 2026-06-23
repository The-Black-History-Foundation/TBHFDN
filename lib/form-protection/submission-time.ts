const MIN_MS = 4000;

export function checkSubmissionTime(
  formLoadedAt: unknown,
  nowMs: number = Date.now()
): { ok: true } | { ok: false; reason: string } {
  if (formLoadedAt == null || formLoadedAt === "") {
    return { ok: false, reason: "submission_time_missing" };
  }
  const n = typeof formLoadedAt === "number" ? formLoadedAt : Number(formLoadedAt);
  if (!Number.isFinite(n) || n <= 0) {
    return { ok: false, reason: "submission_time_invalid" };
  }
  if (nowMs - n < MIN_MS) {
    return { ok: false, reason: "submission_time_too_fast" };
  }
  return { ok: true };
}
