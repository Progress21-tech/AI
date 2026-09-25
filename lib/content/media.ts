const marker = '#alt=';

export function imageSourceAndAlt(value: string, fallback = ''): { src: string; alt: string } {
  const index = value.lastIndexOf(marker);
  if (index < 0) return { src: value, alt: fallback };
  try { return { src: value.slice(0, index), alt: decodeURIComponent(value.slice(index + marker.length)) || fallback }; }
  catch { return { src: value.slice(0, index), alt: fallback }; }
}

export function withImageAlt(value: string, alt: string) {
  const src = imageSourceAndAlt(value).src;
  return `${src}${marker}${encodeURIComponent(alt.trim())}`;
}

export function hasImageAlt(value: string) {
  const { alt } = imageSourceAndAlt(value);
  return Boolean(alt.trim());
}

export function isStoredImage(value: string) {
  if (!hasImageAlt(value)) return false;
  try {
    const parsed = new URL(imageSourceAndAlt(value).src);
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return parsed.protocol === 'https:' && Boolean(base) && parsed.origin === new URL(base!).origin && parsed.pathname.startsWith('/storage/v1/object/public/probetech-content/');
  } catch { return false; }
}
