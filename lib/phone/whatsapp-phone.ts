/**
 * Números para WhatsApp Cloud API (Meta): E.164 sin "+".
 * Móvil Chile (569…) y móvil Argentina (549…).
 */

const CHILE_MOBILE = /^569[0-9]{8}$/;
/** 549 + área + abonado (móvil AR; típico 12–14 dígitos en total). */
const ARGENTINA_MOBILE = /^549[0-9]{9,11}$/;

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Normaliza y valida. Devuelve null si no reconoce un móvil CL/AR válido.
 */
export function normalizeWhatsAppPhone(raw: string): string | null {
  const d = digitsOnly(raw);

  // Chile: internacional 569 + 8
  if (d.length === 11 && d.startsWith("569") && CHILE_MOBILE.test(d)) return d;

  // Chile: local 9 + 8 dígitos
  if (d.length === 9 && d.startsWith("9")) {
    const ch = `56${d}`;
    return CHILE_MOBILE.test(ch) ? ch : null;
  }

  // Argentina: ya 549…
  if (ARGENTINA_MOBILE.test(d) && d.startsWith("549")) return d;

  // Argentina: pegaron 54 sin el 9 del móvil
  if (d.startsWith("54") && d.length >= 12 && d[2] !== "9") {
    const inserted = `549${d.slice(2)}`;
    if (ARGENTINA_MOBILE.test(inserted)) return inserted;
  }

  // Argentina: local 10 u 11 dígitos empezando en 9 (no confunde con CL: allí son 9 dígitos)
  if (
    (d.length === 10 || d.length === 11) &&
    d.startsWith("9") &&
    !d.startsWith("56")
  ) {
    const ar = `54${d}`;
    if (ARGENTINA_MOBILE.test(ar)) return ar;
  }

  return null;
}

export function whatsappPhoneHint(): string {
  return "Usá móvil Chile (+56 9 …) o Argentina (+54 9 …). Ej.: 912345678, 56912345678, 9112345678 o 5491112345678.";
}
