import { BaseService } from './BaseService';
import { paymentModel, paymentMethodModel, bookingModel } from '@/models';
import { CreateTransactionData, PaymentStatus, TransactionType } from '@/models/Payment';
import { AppError } from '@/middleware/error';

export class PaymentService extends BaseService {
  constructor() {
    super('PaymentService');
  }

  /**
   * Create a new transaction
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<any> {
    try {
      this.log('info', 'Creating new transaction', { 
        bookingId: transactionData.booking_id,
        amount: transactionData.amount,
        type: transactionData.transaction_type
      });

      // Validate required fields
      this.validateRequired(transactionData, [
        'booking_id', 'payer_id', 'recipient_id', 'amount', 
        'transaction_type', 'instructor_amount'
      ]);

      // Validate amount
      if (transactionData.amount <= 0) {
        throw new AppError('Transaction amount must be greater than 0', 400);
      }

      // Validate instructor amount
      if (transactionData.instructor_amount < 0) {
        throw new AppError('Instructor amount cannot be negative', 400);
      }

      // Check if booking exists
      const booking = await bookingModel.findById(transactionData.booking_id);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      // Check if transaction already exists for this booking
      const existingTransaction = await paymentModel.getTransactionByBookingId(transactionData.booking_id);
      if (existingTransaction && transactionData.transaction_type === 'booking') {
        throw new AppError('Transaction already exists for this booking', 409);
      }

      // Calculate platform fee if not provided
      if (transactionData.platform_fee === undefined) {
        transactionData.platform_fee = transactionData.amount - transactionData.instructor_amount;
      }

      // Create transaction
      const transaction = await paymentModel.createTransaction(transactionData);

      // Get transaction with details
      const transactionWithDetails = await paymentModel.getTransactionWithDetails(transaction.id);

      this.log('info', 'Transaction created successfully', { transactionId: transaction.id });

      return transactionWithDetails;

    } catch (error) {
      this.handleError(error, 'createTransaction');
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    stripeChargeId?: string,
    failedReason?: string
  ): Promise<any> {
    try {
      this.log('info', 'Updating transaction status', { transactionId, status });

      // Check if transaction exists
      const transaction = await paymentModel.findById(transactionId);
      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // Validate status transition
      if (!this.isValidStatusTransition(transaction.status, status)) {
        throw new AppError(
          `Cannot change status from ${transaction.status} to ${status}`,
          400
        );
      }

      // Update transaction status
      const updatedTransaction = await paymentModel.updateTransactionStatus(
        transactionId,
        status,
        stripeChargeId,
        failedReason
      );

      // Handle side effects based on new status
      if (status === 'paid') {
        await this.handleSuccessfulPayment(transactionId);
      } else if (status === 'failed') {
        await this.handleFailedPayment(transactionId, failedReason);
      }

      // Get updated transaction with details
      const transactionWithDetails = await paymentModel.getTransactionWithDetails(transactionId);

      this.log('info', 'Transaction status updated successfully', { transactionId, status });

      return transactionWithDetails;

    } catch (error) {
      this.handleError(error, 'updateTransactionStatus');
    }
  }

  /**
   * Get transaction by ID with details
   */
  async getTransactionById(transactionId: string): Promise<any> {
    try {
      this.log('info', 'Fetching transaction by ID', { transactionId });

      const transaction = await paymentModel.getTransactionWithDetails(transactionId);
      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      return transaction;

    } catch (error) {
      this.handleError(error, 'getTransactionById');
    }
  }

  /**
   * Get transaction by booking ID
   */
  async getTransactionByBookingId(bookingId: string): Promise<any> {
    try {
      this.log('info', 'Fetching transaction by booking ID', { bookingId });

      const transaction = await paymentModel.getTransactionByBookingId(bookingId);
      if (!transaction) {
        throw new AppError('Transaction not found for this booking', 404);
      }

      return transaction;

    } catch (error) {
      this.handleError(error, 'getTransactionByBookingId');
    }
  }

  /**
   * Get transactions for user
   */
  async getTransactionsForUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    status?: PaymentStatus
  ): Promise<{
    transactions: any[];
    pagination: any;
  }> {
    try {
      this.log('info', 'Fetching transactions for user', { userId, limit, offset, status });

      const transactions = await paymentModel.getTransactionsForUser(userId, limit, offset, status);
      
      // Get total count for pagination (simplified)
      const total = await paymentModel.count({ 
        $or: [{ payer_id: userId }, { recipient_id: userId }] 
      });

      const pagination = this.createPaginationInfo(total, limit, offset);

      return {
        transactions,
        pagination
      };

    } catch (error) {
      this.handleError(error, 'getTransactionsForUser');
    }
  }

  /**
   * Get instructor earnings summary
   */
  async getInstructorEarnings(
    instructorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      this.log('info', 'Fetching instructor earnings', { instructorId, startDate, endDate });

      const earnings = await paymentModel.getInstructorEarnings(instructorId, startDate, endDate);

      return earnings;

    } catch (error) {
      this.handleError(error, 'getInstructorEarnings');
    }
  }

  /**
   * Get platform revenue summary
   */
  async getPlatformRevenue(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      this.log('info', 'Fetching platform revenue', { startDate, endDate });

      const revenue = await paymentModel.getPlatformRevenue(startDate, endDate);

      return revenue;

    } catch (error) {
      this.handleError(error, 'getPlatformRevenue');
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    originalTransactionId: string,
    refundAmount: number,
    reason: string
  ): Promise<any> {
    try {
      this.log('info', 'Processing refund', { originalTransactionId, refundAmount, reason });

      // Validate refund amount
      if (refundAmount <= 0) {
        throw new AppError('Refund amount must be greater than 0', 400);
      }

      // Get original transaction
      const originalTransaction = await paymentModel.findById(originalTransactionId);
      if (!originalTransaction) {
        throw new AppError('Original transaction not found', 404);
      }

      // Validate refund amount doesn't exceed original amount
      if (refundAmount > originalTransaction.amount) {
        throw new AppError('Refund amount cannot exceed original transaction amount', 400);
      }

      // Only allow refunds for paid transactions
      if (originalTransaction.status !== 'paid') {
        throw new AppError('Can only refund paid transactions', 400);
      }

      // Create refund transaction
      const refundTransaction = await paymentModel.processRefund(
        originalTransactionId,
        refundAmount,
        reason
      );

      // In a real implementation, you would process the refund with Stripe here
      // For now, we'll mark it as paid immediately
      await paymentModel.updateTransactionStatus(refundTransaction.id, 'paid');

      // Get refund transaction with details
      const refundWithDetails = await paymentModel.getTransactionWithDetails(refundTransaction.id);

      this.log('info', 'Refund processed successfully', { refundTransactionId: refundTransaction.id });

      return refundWithDetails;

    } catch (error) {
      this.handleError(error, 'processRefund');
    }
  }

  /**
   * Get pending payouts for instructors
   */
  async getPendingPayouts(): Promise<any[]> {
    try {
      this.log('info', 'Fetching pending payouts');

      const payouts = await paymentModel.getPendingPayouts();

      return payouts;

    } catch (error) {
      this.handleError(error, 'getPendingPayouts');
    }
  }

  /**
   * Record payout transaction
   */
  async recordPayout(
    instructorId: string,
    amount: number,
    stripeTransferId: string
  ): Promise<any> {
    try {
      this.log('info', 'Recording payout transaction', { instructorId, amount });

      // Validate amount
      if (amount <= 0) {
        throw new AppError('Payout amount must be greater than 0', 400);
      }

      // Record payout
      const payoutTransaction = await paymentModel.recordPayout(
        instructorId,
        amount,
        stripeTransferId
      );

      this.log('info', 'Payout recorded successfully', { payoutTransactionId: payoutTransaction.id });

      return payoutTransaction;

    } catch (error) {
      this.handleError(error, 'recordPayout');
    }
  }

  /**
   * Get daily transaction summary
   */
  async getDailyTransactionSummary(date: Date): Promise<any> {
    try {
      this.log('info', 'Fetching daily transaction summary', { date });

      const summary = await paymentModel.getDailyTransactionSummary(date);

      return summary;

    } catch (error) {
      this.handleError(error, 'getDailyTransactionSummary');
    }
  }

  /**
   * Add payment method for user
   */
  async addPaymentMethod(
    userId: string,
    stripePaymentMethodId: string,
    type: string,
    lastFour?: string,
    brand?: string
  ): Promise<any> {
    try {
      this.log('info', 'Adding payment method', { userId, type });

      const paymentMethod = await paymentMethodModel.addPaymentMethod({
        user_id: userId,
        stripe_payment_method_id: stripePaymentMethodId,
        type,
        last_four: lastFour,
        brand,
        is_default: false
      });

      this.log('info', 'Payment method added successfully', { paymentMethodId: paymentMethod.id });

      return paymentMethod;

    } catch (error) {
      this.handleError(error, 'addPaymentMethod');
    }
  }

  /**
   * Get user's payment methods
   */
  async getUserPaymentMethods(userId: string): Promise<any[]> {
    try {
      this.log('info', 'Fetching user payment methods', { userId });

      const paymentMethods = await paymentMethodModel.getUserPaymentMethods(userId);

      return paymentMethods;

    } catch (error) {
      this.handleError(error, 'getUserPaymentMethods');
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Setting default payment method', { userId, paymentMethodId });

      const success = await paymentMethodModel.setDefaultPaymentMethod(userId, paymentMethodId);
      
      if (!success) {
        throw new AppError('Failed to set default payment method', 500);
      }

      this.log('info', 'Default payment method set successfully', { userId, paymentMethodId });

      return { message: 'Default payment method updated successfully' };

    } catch (error) {
      this.handleError(error, 'setDefaultPaymentMethod');
    }
  }

  /**
   * Deactivate payment method
   */
  async deactivatePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    try {
      this.log('info', 'Deactivating payment method', { paymentMethodId });

      const success = await paymentMethodModel.deactivatePaymentMethod(paymentMethodId);
      
      if (!success) {
        throw new AppError('Failed to deactivate payment method', 500);
      }

      this.log('info', 'Payment method deactivated successfully', { paymentMethodId });

      return { message: 'Payment method deactivated successfully' };

    } catch (error) {
      this.handleError(error, 'deactivatePaymentMethod');
    }
  }

  // Private helper methods

  private isValidStatusTransition(currentStatus: PaymentStatus, newStatus: PaymentStatus): boolean {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      'pending': ['paid', 'failed'],
      'paid': ['refunded'],
      'refunded': [], // No transitions from refunded
      'failed': []    // No transitions from failed
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async handleSuccessfulPayment(transactionId: string): Promise<void> {
    try {
      // Get transaction to find associated booking
      const transaction = await paymentModel.findById(transactionId);
      if (transaction && transaction.transaction_type === 'booking') {
        // Update booking status to confirmed after successful payment
        await bookingModel.updateStatus(transaction.booking_id, 'confirmed' as any);
      }

      this.log('info', 'Successful payment handled', { transactionId });

    } catch (error) {
      this.log('error', 'Error handling successful payment', { transactionId, error: error.message });
    }
  }

  private async handleFailedPayment(transactionId: string, failedReason?: string): Promise<void> {
    try {
      // Get transaction to find associated booking
      const transaction = await paymentModel.findById(transactionId);
      if (transaction && transaction.transaction_type === 'booking') {
        // Cancel booking if payment failed
        await bookingModel.updateStatus(transaction.booking_id, 'cancelled_by_client' as any);
      }

      this.log('info', 'Failed payment handled', { transactionId, failedReason });

    } catch (error) {
      this.log('error', 'Error handling failed payment', { transactionId, error: error.message });
    }
  }
}