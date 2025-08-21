/**
 * Normalizes shareable URLs to use the current origin (for development)
 * Converts production URLs to local development URLs
 * Updated for HashRouter compatibility
 */
export function toLocalShareUrl(shareable: string): string {
  // shareable can be "https://rankandrenttool.com/v/abc" or "v/abc" or "/v/abc"
  const u = new URL(shareable, window.location.origin);
  // force current origin in dev
  u.protocol = window.location.protocol;
  u.host = window.location.host;
  // For hash routing, we need to add the hash prefix
  return u.toString().replace(window.location.origin, window.location.origin + '/#');
}

/**
 * Converts relative paths to absolute URLs
 * Handles both relative and absolute URLs
 * Updated for HashRouter compatibility
 */
export function toAbsolute(p?: string): string {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.startsWith('/') ? p.slice(1) : p;
  return `${window.location.origin}/${clean}`;
}

/**
 * Generates a shareable URL for a video
 * Updated for HashRouter compatibility
 */
export function generateShareableUrl(shareableId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/#/v/${shareableId}`;
}
