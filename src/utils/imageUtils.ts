/**
 * Image helper utilities for fast, reliable local asset delivery
 * Eliminates third-party host blocking (adblockers, Safari tracking prevention, Chrome incognito, etc.)
 */

export const LOCAL_IMAGES = {
  hero: '/images/hero.jpg',
  dressCode: '/images/dresscode.jpg',
  final: '/images/final.jpg',
  gallery: [
    '/images/gallery-1.jpg',
    '/images/gallery-2.jpg',
    '/images/gallery-3.jpg',
    '/images/gallery-4.jpg',
  ],
};

/**
 * Normalizes an image URL to replace blocked third-party URLs (e.g. postimg.cc)
 * with fast, reliable local assets while respecting custom user uploads.
 */
export function normalizeImageUrl(url: string | undefined | null, fallback: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const clean = url.trim();

  // If it's a known postimg.cc hotlink that gets blocked by mobile privacy / incognito / adblockers:
  if (clean.includes('postimg.cc')) {
    if (clean.includes('19-55-12-(2)') || clean.includes('mrY8tVNy')) return LOCAL_IMAGES.hero;
    if (clean.includes('22-11-18-(2)') || clean.includes('9F08JdCT')) return LOCAL_IMAGES.dressCode;
    if (clean.includes('22-11-20-(3)') || clean.includes('tCskh9NT')) return LOCAL_IMAGES.final;
    if (clean.includes('19-55-11-(1)') || clean.includes('jqgvwDPN')) return LOCAL_IMAGES.gallery[0];
    if (clean.includes('19-55-10') || clean.includes('J76KDsZk')) return LOCAL_IMAGES.gallery[1];
    if (clean.includes('19-55-11-(2)') || clean.includes('1RCMn8wF')) return LOCAL_IMAGES.gallery[2];
    if (clean.includes('22-11-20-(2)') || clean.includes('44Lw7YVV')) return LOCAL_IMAGES.gallery[3];
    return fallback;
  }

  return clean;
}

/**
 * Handle image onError event gracefully by falling back to safe local image
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallback: string) {
  const target = e.currentTarget;
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  }
}
