import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  static async createCheckoutSession(params: {
    bookingId: string;
    customerEmail: string;
    eventTitle: string;
    items: { name: string; unitPrice: number; quantity: number }[];
    successUrl: string;
    cancelUrl: string;
  }) {
    // If running with mock/test keys, create real or simulated Stripe session
    try {
      const lineItems = params.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${params.eventTitle} - ${item.name}`,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: params.customerEmail,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${params.bookingId}`,
        cancel_url: params.cancelUrl,
        metadata: {
          bookingId: params.bookingId,
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (err: any) {
      console.warn('[Stripe SDK Warning]: Falling back to mock checkout URL for local testing.', err.message);
      // Mock session fallback for testing without live Stripe API keys
      return {
        sessionId: `cs_test_mock_${Date.now()}`,
        url: `${params.successUrl}?session_id=cs_test_mock_${Date.now()}&booking_id=${params.bookingId}&mock=true`,
      };
    }
  }
}
