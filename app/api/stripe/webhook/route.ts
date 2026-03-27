import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/services/stripe.service";
import { confirmReservation } from "@/lib/services/reservation.service";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const event = await constructWebhookEvent(body, signature);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.items) {
          const items = JSON.parse(session.metadata.items);

          for (const item of items) {
            const { getReservationById, createReservation, updateReservationStripeId } =
              await import("@/lib/repositories/reservation.repository");

            let reservation = await getReservationById(item.reservationId || session.id);

            if (!reservation) {
              const { calculateTotalPrice } = await import(
                "@/lib/services/availability.service"
              );

              const totalPrice = await calculateTotalPrice(
                item.propertyId,
                new Date(item.checkIn),
                new Date(item.checkOut)
              );

              const newReservation = await createReservation({
                propertyId: item.propertyId,
                checkIn: new Date(item.checkIn),
                checkOut: new Date(item.checkOut),
                guestName: item.guestName,
                guestEmail: item.guestEmail,
                guestPhone: item.guestPhone || undefined,
                notes: item.notes,
                totalPrice,
                stripeId: session.id,
              });

              await updateReservationStripeId(newReservation.id, session.id);
              await confirmReservation(newReservation.id);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
