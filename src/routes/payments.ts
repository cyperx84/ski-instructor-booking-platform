import { Router } from 'express';
import { PaymentService } from '../services/PaymentService';
import { authenticateToken as auth } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { ApiResponse } from '../types';

const router = Router();
const paymentService = new PaymentService();

// Test endpoint for Stripe integration
router.post('/test-stripe', asyncHandler(async (req, res) => {
  // Simple test to verify Stripe configuration
  const testResult = {
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  };

  const response: ApiResponse = {
    success: true,
    message: 'Stripe configuration test completed',
    data: testResult
  };

  res.json(response);
}));

// Create a payment intent for booking
router.post('/create-payment-intent', auth, asyncHandler(async (req, res) => {
  const { booking_id, amount } = req.body;

  if (!booking_id || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Booking ID and amount are required'
    });
  }

  // In a real implementation, we would:
  // 1. Validate the booking exists and belongs to the user
  // 2. Create a Stripe PaymentIntent
  // 3. Return the client secret for frontend processing

  const mockPaymentIntent = {
    id: `pi_test_${Date.now()}`,
    client_secret: `pi_test_${Date.now()}_secret_test`,
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    status: 'requires_payment_method'
  };

  const response: ApiResponse = {
    success: true,
    message: 'Payment intent created successfully',
    data: {
      paymentIntent: mockPaymentIntent,
      booking_id
    }
  };

  res.json(response);
}));

// Process a completed payment
router.post('/process-payment', auth, asyncHandler(async (req, res) => {
  const { payment_intent_id, booking_id } = req.body;

  if (!payment_intent_id || !booking_id) {
    return res.status(400).json({
      success: false,
      message: 'Payment intent ID and booking ID are required'
    });
  }

  // Mock payment processing
  const processedPayment = {
    payment_intent_id,
    booking_id,
    status: 'succeeded',
    amount: 150.00,
    currency: 'usd',
    processed_at: new Date().toISOString()
  };

  const response: ApiResponse = {
    success: true,
    message: 'Payment processed successfully',
    data: processedPayment
  };

  res.json(response);
}));

// Get payment methods for user
router.get('/payment-methods', auth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  const paymentMethods = await paymentService.getUserPaymentMethods(userId);

  const response: ApiResponse = {
    success: true,
    message: 'Payment methods retrieved successfully',
    data: paymentMethods
  };

  res.json(response);
}));

// Add payment method for user
router.post('/payment-methods', auth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { stripe_payment_method_id, type, last_four, brand } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (!stripe_payment_method_id || !type) {
    return res.status(400).json({
      success: false,
      message: 'Payment method ID and type are required'
    });
  }

  const paymentMethod = await paymentService.addPaymentMethod(
    userId,
    stripe_payment_method_id,
    type,
    last_four,
    brand
  );

  const response: ApiResponse = {
    success: true,
    message: 'Payment method added successfully',
    data: paymentMethod
  };

  res.status(201).json(response);
}));

// Create transaction
router.post('/transactions', auth, asyncHandler(async (req, res) => {
  const transactionData = req.body;

  if (!transactionData.booking_id || !transactionData.amount) {
    return res.status(400).json({
      success: false,
      message: 'Booking ID and amount are required'
    });
  }

  const transaction = await paymentService.createTransaction(transactionData);

  const response: ApiResponse = {
    success: true,
    message: 'Transaction created successfully',
    data: transaction
  };

  res.status(201).json(response);
}));

// Get transaction by ID
router.get('/transactions/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await paymentService.getTransactionById(id);

  const response: ApiResponse = {
    success: true,
    message: 'Transaction retrieved successfully',
    data: transaction
  };

  res.json(response);
}));

// Get transactions for user
router.get('/transactions', auth, asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { limit = 20, offset = 0, status } = req.query;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  const result = await paymentService.getTransactionsForUser(
    userId,
    parseInt(limit as string),
    parseInt(offset as string),
    status as any
  );

  const response: ApiResponse = {
    success: true,
    message: 'Transactions retrieved successfully',
    data: {
      transactions: result.transactions,
      pagination: result.pagination
    }
  };

  res.json(response);
}));

export default router;