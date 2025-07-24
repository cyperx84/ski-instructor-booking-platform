import { BaseModel } from './BaseModel';
import { v4 as uuidv4 } from 'uuid';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type TransactionType = 'booking' | 'refund' | 'payout';

export interface PaymentMethodData {
  id?: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: string;
  last_four?: string;
  brand?: string;
  is_default?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface TransactionData {
  id?: string;
  booking_id: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  currency?: string;
  transaction_type: TransactionType;
  status?: PaymentStatus;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  platform_fee?: number;
  instructor_amount: number;
  payment_method_id?: string;
  processed_at?: Date;
  failed_reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTransactionData {
  booking_id: string;
  payer_id: string;
  recipient_id: string;
  amount: number;
  transaction_type: TransactionType;
  instructor_amount: number;
  platform_fee?: number;
  payment_method_id?: string;
  stripe_payment_intent_id?: string;
}

export class Payment extends BaseModel {
  constructor() {
    super('transactions');
  }

  /**
   * Create a new transaction
   */
  async createTransaction(transactionData: CreateTransactionData): Promise<TransactionData> {
    const transactionRecord = {
      id: uuidv4(),
      booking_id: transactionData.booking_id,
      payer_id: transactionData.payer_id,
      recipient_id: transactionData.recipient_id,
      amount: transactionData.amount,
      currency: 'USD',
      transaction_type: transactionData.transaction_type,
      status: 'pending' as PaymentStatus,
      platform_fee: transactionData.platform_fee || 0,
      instructor_amount: transactionData.instructor_amount,
      payment_method_id: transactionData.payment_method_id,
      stripe_payment_intent_id: transactionData.stripe_payment_intent_id
    };

    return await this.create(transactionRecord);
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    stripeChargeId?: string,
    failedReason?: string
  ): Promise<TransactionData | null> {
    const updateData: any = { status };

    if (status === 'paid') {
      updateData.processed_at = new Date();
    }

    if (stripeChargeId) {
      updateData.stripe_charge_id = stripeChargeId;
    }

    if (failedReason) {
      updateData.failed_reason = failedReason;
    }

    return await this.update(transactionId, updateData);
  }

  /**
   * Get transaction by booking ID
   */
  async getTransactionByBookingId(bookingId: string): Promise<TransactionData | null> {
    const result = await this.query(
      'SELECT * FROM transactions WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
      [bookingId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get transaction with details
   */
  async getTransactionWithDetails(transactionId: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        t.*,
        b.lesson_date,
        b.start_time,
        b.lesson_type,
        payer.first_name as payer_first_name,
        payer.last_name as payer_last_name,
        payer.email as payer_email,
        recipient.first_name as recipient_first_name,
        recipient.last_name as recipient_last_name,
        recipient.email as recipient_email,
        pm.type as payment_method_type,
        pm.last_four as payment_method_last_four,
        pm.brand as payment_method_brand
      FROM transactions t
      JOIN bookings b ON t.booking_id = b.id
      JOIN users payer ON t.payer_id = payer.id
      JOIN users recipient ON t.recipient_id = recipient.id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.id = $1
    `, [transactionId]);

    return result.rows[0] || null;
  }

  /**
   * Get transactions for user (as payer or recipient)
   */
  async getTransactionsForUser(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    status?: PaymentStatus
  ): Promise<any[]> {
    let query = `
      SELECT 
        t.*,
        b.lesson_date,
        b.start_time,
        b.lesson_type,
        CASE 
          WHEN t.payer_id = $1 THEN 'outgoing'
          ELSE 'incoming'
        END as transaction_direction,
        CASE 
          WHEN t.payer_id = $1 THEN recipient.first_name || ' ' || recipient.last_name
          ELSE payer.first_name || ' ' || payer.last_name
        END as other_party_name
      FROM transactions t
      JOIN bookings b ON t.booking_id = b.id
      JOIN users payer ON t.payer_id = payer.id
      JOIN users recipient ON t.recipient_id = recipient.id
      WHERE (t.payer_id = $1 OR t.recipient_id = $1)
    `;
    
    const params: any[] = [userId];
    let paramCount = 1;

    if (status) {
      query += ` AND t.status = $${++paramCount}`;
      params.push(status);
    }

    query += `
      ORDER BY t.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Get instructor earnings summary
   */
  async getInstructorEarnings(
    instructorId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    let query = `
      SELECT 
        COUNT(CASE WHEN t.status = 'paid' THEN 1 END) as completed_transactions,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.instructor_amount END), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.platform_fee END), 0) as total_platform_fees,
        COALESCE(SUM(CASE WHEN t.status = 'paid' THEN t.amount END), 0) as total_gross_amount,
        COALESCE(AVG(CASE WHEN t.status = 'paid' THEN t.instructor_amount END), 0) as average_earning_per_lesson
      FROM transactions t
      JOIN bookings b ON t.booking_id = b.id
      WHERE t.recipient_id = $1
      AND t.transaction_type = 'booking'
    `;
    
    const params: any[] = [instructorId];
    let paramCount = 1;

    if (startDate) {
      query += ` AND t.created_at >= $${++paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND t.created_at <= $${++paramCount}`;
      params.push(endDate);
    }

    const result = await this.query(query, params);
    return result.rows[0];
  }

  /**
   * Get platform revenue summary
   */
  async getPlatformRevenue(startDate?: Date, endDate?: Date): Promise<any> {
    let query = `
      SELECT 
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN platform_fee END), 0) as total_platform_revenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount END), 0) as total_gross_volume,
        COALESCE(AVG(platform_fee), 0) as average_platform_fee
      FROM transactions
      WHERE transaction_type = 'booking'
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (startDate) {
      query += ` AND created_at >= $${++paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= $${++paramCount}`;
      params.push(endDate);
    }

    const result = await this.query(query, params);
    return result.rows[0];
  }

  /**
   * Process refund
   */
  async processRefund(
    originalTransactionId: string,
    refundAmount: number,
    reason: string
  ): Promise<TransactionData> {
    const originalTransaction = await this.findById(originalTransactionId);
    if (!originalTransaction) {
      throw new Error('Original transaction not found');
    }

    const refundTransaction = {
      id: uuidv4(),
      booking_id: originalTransaction.booking_id,
      payer_id: originalTransaction.recipient_id, // Reversed
      recipient_id: originalTransaction.payer_id, // Reversed
      amount: -refundAmount, // Negative amount for refund
      currency: originalTransaction.currency,
      transaction_type: 'refund' as TransactionType,
      status: 'pending' as PaymentStatus,
      platform_fee: 0,
      instructor_amount: -refundAmount,
      failed_reason: reason
    };

    return await this.create(refundTransaction);
  }

  /**
   * Get pending payouts for instructors
   */
  async getPendingPayouts(): Promise<any[]> {
    const result = await this.query(`
      SELECT 
        t.recipient_id as instructor_id,
        u.first_name,
        u.last_name,
        u.email,
        SUM(t.instructor_amount) as total_pending,
        COUNT(*) as transaction_count,
        MIN(t.processed_at) as oldest_transaction
      FROM transactions t
      JOIN users u ON t.recipient_id = u.id
      WHERE t.status = 'paid'
      AND t.transaction_type = 'booking'
      AND t.recipient_id NOT IN (
        SELECT DISTINCT recipient_id 
        FROM transactions 
        WHERE transaction_type = 'payout' 
        AND status = 'paid'
        AND processed_at >= t.processed_at
      )
      GROUP BY t.recipient_id, u.first_name, u.last_name, u.email
      HAVING SUM(t.instructor_amount) > 0
      ORDER BY total_pending DESC
    `);

    return result.rows;
  }

  /**
   * Record payout transaction
   */
  async recordPayout(
    instructorId: string,
    amount: number,
    stripeTransferId: string
  ): Promise<TransactionData> {
    const payoutTransaction = {
      id: uuidv4(),
      booking_id: uuidv4(), // Dummy booking ID for payout
      payer_id: 'platform', // Platform as payer
      recipient_id: instructorId,
      amount: amount,
      currency: 'USD',
      transaction_type: 'payout' as TransactionType,
      status: 'paid' as PaymentStatus,
      stripe_charge_id: stripeTransferId,
      platform_fee: 0,
      instructor_amount: amount,
      processed_at: new Date()
    };

    return await this.create(payoutTransaction);
  }

  /**
   * Get daily transaction summary
   */
  async getDailyTransactionSummary(date: Date): Promise<any> {
    const result = await this.query(`
      SELECT 
        DATE(created_at) as transaction_date,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount END), 0) as total_volume,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN platform_fee END), 0) as platform_revenue
      FROM transactions
      WHERE DATE(created_at) = $1
      GROUP BY DATE(created_at)
    `, [date]);

    return result.rows[0] || {
      transaction_date: date,
      total_transactions: 0,
      successful_transactions: 0, 
      failed_transactions: 0,
      total_volume: 0,
      platform_revenue: 0
    };
  }
}

/**
 * Payment Methods Model
 */
export class PaymentMethod extends BaseModel {
  constructor() {
    super('payment_methods');
  }

  /**
   * Add payment method for user
   */
  async addPaymentMethod(paymentMethodData: Omit<PaymentMethodData, 'id'>): Promise<PaymentMethodData> {
    const paymentMethod = {
      id: uuidv4(),
      ...paymentMethodData,
      is_active: true
    };

    return await this.create(paymentMethod);
  }

  /**
   * Get user's payment methods
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethodData[]> {
    return await this.findAll({ user_id: userId, is_active: true });
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    await this.transaction(async (client) => {
      // Remove default flag from all user's payment methods
      await client.query(
        'UPDATE payment_methods SET is_default = false WHERE user_id = $1',
        [userId]
      );

      // Set the specified payment method as default
      await client.query(
        'UPDATE payment_methods SET is_default = true WHERE id = $1 AND user_id = $2',
        [paymentMethodId, userId]
      );
    });

    return true;
  }

  /**
   * Deactivate payment method
   */
  async deactivatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    const result = await this.update(paymentMethodId, { is_active: false });
    return !!result;
  }
}