/** Canonical public community wiki (MediaWiki at wiki.tbhfdn.org). */
export const DEFAULT_WIKI_URL = "https://wiki.tbhfdn.org";

const LEGACY_RAILWAY_WIKI_PATTERN = /up\.railway\.app/i;

function resolveWikiUrlFromEnv(raw: string | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed || LEGACY_RAILWAY_WIKI_PATTERN.test(trimmed)) {
    return DEFAULT_WIKI_URL;
  }
  return trimmed;
}

/**
 * Public wiki URL. Defaults to {@link DEFAULT_WIKI_URL}; override with
 * `NEXT_PUBLIC_WIKI_URL` in Vercel or `.env.local` (legacy Railway URLs are ignored).
 */
export function getWikiUrl(): string {
  return resolveWikiUrlFromEnv(process.env.NEXT_PUBLIC_WIKI_URL);
}

export function isWikiConfigured(): boolean {
  return Boolean(getWikiUrl());
}