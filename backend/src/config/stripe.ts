import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Platform fee percentage (e.g., 15%)
export const PLATFORM_FEE_PERCENTAGE = 0.15;

export const calculateFees = (totalAmount: number) => {
  const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENTAGE);
  const instructorPayout = totalAmount - platformFee;

  return {
    platformFee,
    instructorPayout,
  };
};
