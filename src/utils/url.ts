/**
 * Normalizes shareable URLs to use the current origin (for development)
 * Converts production URLs to local development URLs
 */
export function toLocalShareUrl(shareable: string): string {
  // shareable can be "https://rankandrenttool.com/v/abc" or "v/abc" or "/v/abc"
  const u = new URL(shareable, window.location.origin);
  // force current origin in dev
  u.protocol = window.location.protocol;
  u.host = window.location.host;
  return u.toString();
}

/**
 * Converts relative paths to absolute URLs
 * Handles both relative and absolute URLs
 */
export function toAbsolute(p?: string): string {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith('/') ? p.slice(1) : p;
  return `${window.location.origin}/${clean}`;
}

/**
 * Generates a shareable URL for a video
 */
export function generateShareableUrl(shareableId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/v/${shareableId}`;
}
