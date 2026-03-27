import Stripe from "stripe";
import { getPropertyById } from "@/lib/repositories/property.repository";
import { calculateNights } from "@/lib/services/availability.service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export interface CheckoutItem {
  reservationId: string;
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
}

export async function createCheckoutSession(
  items: CheckoutItem[],
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  if (items.length === 0) {
    throw new Error("Checkout requires at least one item");
  }

  const primaryReservationId = items[0].reservationId;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const property = await getPropertyById(item.propertyId);
    if (!property) throw new Error(`Propiedad no encontrada: ${item.propertyId}`);

    const nights = await calculateNights(
      item.propertyId,
      item.checkIn,
      item.checkOut
    );
    if (nights <= 0) throw new Error("Fechas inválidas");

    lineItems.push({
      price_data: {
        currency: "clp",
        product_data: {
          name: `${property.name} - ${nights} noche${nights > 1 ? "s" : ""}`,
          description: `${item.checkIn.toLocaleDateString("es-CL")} - ${item.checkOut.toLocaleDateString("es-CL")}`,
          images: property.images.slice(0, 1),
        },
        unit_amount: Math.round(Number(property.pricePerNight)),
      },
      quantity: nights,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      reservationId: primaryReservationId,
      items: JSON.stringify(
        items.map((item) => ({
          reservationId: item.reservationId,
          propertyId: item.propertyId,
          checkIn: item.checkIn.toISOString(),
          checkOut: item.checkOut.toISOString(),
          guestCount: item.guestCount,
          guestName: item.guestName,
          guestEmail: item.guestEmail,
          guestPhone: item.guestPhone || "",
          notes: item.notes || "",
        }))
      ),
    },
    payment_intent_data: {
      metadata: {
        reservationId: primaryReservationId,
      },
    },
    customer_email: items[0].guestEmail,
  });

  return session;
}

export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  });
}
