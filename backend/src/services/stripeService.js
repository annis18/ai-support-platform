import Stripe from 'stripe';
import prisma from '../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe Checkout session.
 * User is redirected here to enter payment details.
 * On success, Stripe redirects back to your app and
 * fires a webhook to confirm the subscription.
 */
export async function createCheckoutSession(orgId, userId) {
  // Upsert org so it exists before we query it
  await prisma.organization.upsert({
    where: { clerkOrgId: orgId },
    update: {},
    create: {
      clerkOrgId: orgId,
      name: orgId,
    },
  });

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?upgraded=true`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?cancelled=true`,
    metadata: { orgId, userId },
    customer: org?.stripeCustomerId || undefined,
  });

  return { url: session.url };
}

/**
 * Handles Stripe webhook events.
 * Stripe sends these to confirm payment events server-side.
 * We verify the signature to ensure the request is from Stripe.
 *
 * Key events:
 * - checkout.session.completed → subscription created, upgrade org to pro
 * - customer.subscription.deleted → subscription cancelled, downgrade to free
 */
export async function handleWebhook(rawBody, signature) {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { orgId } = session.metadata;

      await prisma.organization.update({
        where: { clerkOrgId: orgId },
        data: {
          plan: 'pro',
          stripeCustomerId: session.customer,
          stripeSubId: session.subscription,
        },
      });

      console.log(`[Stripe] Org ${orgId} upgraded to Pro`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      await prisma.organization.updateMany({
        where: { stripeSubId: subscription.id },
        data: {
          plan: 'free',
          stripeSubId: null,
        },
      });

      console.log(`[Stripe] Subscription cancelled — org downgraded to free`);
      break;
    }

    default:
      console.log(`[Stripe] Unhandled event: ${event.type}`);
  }

  return { received: true };
}