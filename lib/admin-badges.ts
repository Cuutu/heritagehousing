/** Badges de fuente de reserva — reconocibles y alineados a la marca */
export const adminSourceBadgeClass = (source: string): string => {
  const map: Record<string, string> = {
    DIRECT:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
    AIRBNB: "border-transparent bg-pink-600 text-white hover:bg-pink-600",
    BOOKING: "border-transparent bg-indigo-600 text-white hover:bg-indigo-600",
    MANUAL: "border-transparent bg-[var(--paragraph)]/85 text-white hover:bg-[var(--paragraph)]",
  };
  return map[source] ?? map.MANUAL;
};

/** Estados de pago */
export const adminPaymentBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    PAID: "border-transparent bg-emerald-600 text-white hover:bg-emerald-600",
    PENDING:
      "border-transparent bg-amber-500 text-stone-900 hover:bg-amber-500",
    CANCELLED: "border-transparent bg-red-600 text-white hover:bg-red-600",
    REFUNDED: "border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-100",
  };
  return map[status] ?? map.PENDING;
};

/** Bloques de color en calendario (fondo de evento por fuente) */
export const adminCalendarSourceBg = (source: string): string => {
  const map: Record<string, string> = {
    DIRECT: "bg-primary",
    AIRBNB: "bg-pink-500",
    BOOKING: "bg-indigo-600",
    MANUAL: "bg-[var(--paragraph)]",
    airbnb: "bg-pink-500",
    booking: "bg-indigo-600",
  };
  return map[source] ?? map.MANUAL;
};
