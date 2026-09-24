/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts a YouTube 11-character Video ID from any standard or shortened YouTube URL.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // Pattern matches typical youtube URL structures
  const match = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|music\.youtube\.com\/watch\?v=)([\w-]{11})/
  );

  if (match && match[1]) {
    return match[1];
  }

  // Also match raw 11-char ID if someone entered just the ID
  if (/^[\w-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  return null;
}

/**
 * Checks if the given URL is a YouTube link
 */
export function isYouTubeUrl(url?: string | null): boolean {
  return extractYouTubeId(url) !== null;
}
