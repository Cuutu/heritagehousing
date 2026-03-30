import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/services/stripe.service";
import { markReservationPaidFromStripe } from "@/lib/services/reservation.service";
import { getReservationById } from "@/lib/repositories/reservation.repository";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, ReservationLifecycleStatus } from "@prisma/client";
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
        try {
          const session = event.data.object as Stripe.Checkout.Session;
          const reservationId = session.metadata?.reservationId;

          if (!reservationId) {
            console.error(
              "Stripe webhook: checkout.session.completed missing reservationId in metadata"
            );
            break;
          }

          const reservation = await getReservationById(reservationId);
          if (!reservation) {
            console.error(
              `Stripe webhook: reservation not found: ${reservationId}`
            );
            break;
          }

          await markReservationPaidFromStripe(reservation.id, session.id);
        } catch (err) {
          console.error(
            "Stripe webhook: checkout.session.completed handler error:",
            err
          );
          throw err;
        }
        break;
      }

      case "checkout.session.expired": {
        try {
          const session = event.data.object as Stripe.Checkout.Session;
          const reservationId = session.metadata?.reservationId;

          if (!reservationId) {
            console.error(
              "Stripe webhook: checkout.session.expired missing reservationId"
            );
            break;
          }

          await prisma.reservation.updateMany({
            where: {
              id: reservationId,
              paymentStatus: PaymentStatus.PENDING,
            },
            data: {
              paymentStatus: PaymentStatus.CANCELLED,
              lifecycleStatus: ReservationLifecycleStatus.CANCELLED,
            },
          });
        } catch (err) {
          console.error(
            "Stripe webhook: checkout.session.expired handler error:",
            err
          );
          throw err;
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
