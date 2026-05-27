/**
 * utils.js — Shared utility functions
 * BUG-29: Previously fmt() was copy-pasted in 4 component files.
 * Centralised here so any future change is made in one place.
 */

/**
 * Format seconds into M:SS display string.
 * @param {number} s - duration in seconds
 * @returns {string}
 */
export function fmt(s) {
  if (!s || isNaN(s) || s < 0) return '0:00';
  const mins = Math.floor(s / 60);
  const secs = String(Math.floor(s % 60)).padStart(2, '0');
  return `${mins}:${secs}`;
}

/**
 * Generate a beautiful, unique SVG data URI avatar placeholder for an artist.
 * BUG-27: Replaces external ui-avatars.com and Unsplash fallbacks with a reliable local generator.
 * @param {string} name - artist name
 * @returns {string} - data URI
 */
export function getArtistPlaceholder(name) {
  const initials = (name || '?')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  // Simple hash for stable color selection
  let hash = 0;
  const str = name || '?';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#4E9F3D', '#1E5128', '#3E7035', '#2C3E50',
    '#8E44AD', '#2980B9', '#27AE60', '#D35400',
    '#C0392B', '#16A085', '#7F8C8D'
  ];
  const color = colors[Math.abs(hash) % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="bold" fill="#ffffff">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

