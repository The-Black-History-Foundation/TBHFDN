/**
 * Public wiki URL (Railway-hosted MediaWiki). Set in Vercel / .env.local.
 */
export function getWikiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_WIKI_URL?.trim();
  return url || null;
}

export function isWikiConfigured(): boolean {
  return Boolean(getWikiUrl());
}
