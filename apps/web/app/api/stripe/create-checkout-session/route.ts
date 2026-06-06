import { NextResponse } from "next/server";
import { z } from "zod";

import { getDonationSiteOrigin, getStripe } from "@/lib/stripe";

const MIN_AMOUNT_CENTS = 50;
const MAX_AMOUNT_CENTS = 1_000_000;

const checkoutSchema = z.object({
  amountCents: z.number().int().min(MIN_AMOUNT_CENTS).max(MAX_AMOUNT_CENTS),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid donation amount (minimum $0.50)." },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Donations are temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripe();
    const origin = getDonationSiteOrigin(request);
    const { amountCents } = parsed.data;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: "Donation to FMS Think Tank",
              description: "Support research in peace, diplomacy, and AI governance.",
            },
          },
        },
      ],
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate/cancel`,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to start checkout. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/create-checkout-session]", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 },
    );
  }
}
