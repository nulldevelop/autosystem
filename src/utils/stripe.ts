import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

export const stripe = new Stripe(apiKey, {
  // biome-ignore lint/suspicious/noExplicitAny: Stripe clover apiVersion missing in typings
  apiVersion: "2025-12-15.clover" as any,
});
