import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

let ratelimit: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (ratelimit !== undefined) return ratelimit;
    console.error(
      "[checkRateLimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set; rate limiting disabled"
    );
    ratelimit = null;
    return null;
  }
  if (ratelimit === undefined) {
    const redis = new Redis({ url, token });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "tbhf-form",
    });
  }
  return ratelimit;
}

/** Returns whether the request is allowed (true) or should receive 429 (false). */
export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  try {
    const rl = getRatelimit();
    if (!rl) return { success: true };
    const result = await rl.limit(identifier);
    return { success: result.success };
  } catch (e) {
    console.error("[checkRateLimit] failed open:", e);
    return { success: true };
  }
}
