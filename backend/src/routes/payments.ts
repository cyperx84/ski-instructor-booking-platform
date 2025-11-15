import { Router } from 'express';
import { stripe, calculateFees } from '../config/stripe';
import { PaymentModel } from '../models/Payment';
import { BookingModel } from '../models/Booking';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CreatePaymentIntentRequest, BookingStatus, PaymentStatus } from '../../../shared/types';

const router = Router();

// Create payment intent for a booking
router.post('/create-payment-intent', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { bookingId }: CreatePaymentIntentRequest = req.body;

    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Get booking details
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Verify user owns this booking
    if (booking.clientId !== req.user.id) {
      throw new AppError('Unauthorized to pay for this booking', 403);
    }

    // Check if payment already exists
    const existingPayment = await PaymentModel.findByBookingId(bookingId);
    if (existingPayment && existingPayment.status === PaymentStatus.SUCCEEDED) {
      throw new AppError('This booking has already been paid for', 400);
    }

    // Calculate fees
    const amountInCents = Math.round(booking.totalPrice * 100);
    const { platformFee, instructorPayout } = calculateFees(amountInCents);

    // Create or update payment record
    let payment;
    if (existingPayment) {
      payment = existingPayment;
    } else {
      payment = await PaymentModel.create(
        bookingId,
        booking.totalPrice,
        platformFee / 100,
        instructorPayout / 100
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
        instructorId: booking.instructorId,
        clientId: booking.clientId,
      },
      description: `Snowboard lesson booking - ${booking.durationHours} hours`,
    });

    // Update payment record with Stripe payment intent ID
    await PaymentModel.updateStatus(
      payment.id,
      PaymentStatus.PENDING,
      paymentIntent.id
    );

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: booking.totalPrice,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Webhook to handle Stripe events
router.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Missing stripe-signature header');
  }

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;
        const paymentId = paymentIntent.metadata.paymentId;

        if (bookingId && paymentId) {
          // Update payment status
          await PaymentModel.updateStatus(
            paymentId,
            PaymentStatus.SUCCEEDED,
            paymentIntent.id,
            paymentIntent.charges.data[0]?.id
          );

          // Update booking status to confirmed
          await BookingModel.updateStatus(bookingId, BookingStatus.CONFIRMED);

          console.log(`Payment succeeded for booking ${bookingId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata.paymentId;

        if (paymentId) {
          await PaymentModel.updateStatus(paymentId, PaymentStatus.FAILED);
          console.log(`Payment failed for payment ${paymentId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

// Get payment details for a booking
router.get('/booking/:bookingId', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check authorization
    if (req.user?.id !== booking.clientId) {
      throw new AppError('Unauthorized to view payment details', 403);
    }

    const payment = await PaymentModel.findByBookingId(req.params.bookingId);

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
