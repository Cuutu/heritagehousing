/**
 * Extrae lat/lng de URLs típicas de Google Maps (sin resolver acortadores).
 * Formatos: @lat,lng, ?q=lat,lng, &ll=, /dir//lat,lng
 */
export function extractLatLngFromGoogleMapsString(input: string): {
  lat: number;
  lng: number;
} | null {
  const s = input.trim();
  if (!s) return null;

  const tryPair = (a: string, b: string) => {
    const lat = parseFloat(a);
    const lng = parseFloat(b);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  };

  const at = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,|$)/);
  if (at) {
    const p = tryPair(at[1], at[2]);
    if (p) return p;
  }

  const q = s.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)(?:&|$)/);
  if (q) {
    const p = tryPair(q[1], q[2]);
    if (p) return p;
  }

  const ll = s.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)(?:&|$)/);
  if (ll) {
    const p = tryPair(ll[1], ll[2]);
    if (p) return p;
  }

  const center = s.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)(?:&|$)/);
  if (center) {
    const p = tryPair(center[1], center[2]);
    if (p) return p;
  }

  return null;
}

/**
 * Sigue redirecciones (p. ej. maps.app.goo.gl) e intenta obtener coordenadas.
 */
export async function resolveGoogleMapsCoordinates(
  input: string
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const direct = extractLatLngFromGoogleMapsString(trimmed);
  if (direct) return direct;

  if (!/^https?:\/\//i.test(trimmed)) return null;

  try {
    const res = await fetch(trimmed, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HeritageHousing/1.0; +https://heritagehousing.cl)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const finalUrl = res.url;
    const fromUrl = extractLatLngFromGoogleMapsString(finalUrl);
    if (fromUrl) return fromUrl;

    const text = await res.text();
    const inHtml = extractLatLngFromGoogleMapsString(text);
    if (inHtml) return inHtml;

    const meta = text.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (meta) {
      const lat = parseFloat(meta[1]);
      const lng = parseFloat(meta[2]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        return { lat, lng };
      }
    }
  } catch {
    return null;
  }

  return null;
}
