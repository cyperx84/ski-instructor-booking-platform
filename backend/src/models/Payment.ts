import { pool } from '../config/database';
import { Payment, PaymentStatus } from '../../../shared/types';

export class PaymentModel {
  static async create(
    bookingId: string,
    amount: number,
    platformFee: number,
    instructorPayout: number,
    currency: string = 'USD'
  ): Promise<Payment> {
    const result = await pool.query(
      `INSERT INTO payments (booking_id, amount, currency, platform_fee, instructor_payout)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [bookingId, amount, currency, platformFee, instructorPayout]
    );

    return this.mapRow(result.rows[0]);
  }

  static async findById(id: string): Promise<Payment | null> {
    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  static async findByBookingId(bookingId: string): Promise<Payment | null> {
    const result = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [bookingId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRow(result.rows[0]);
  }

  static async updateStatus(
    id: string,
    status: PaymentStatus,
    stripePaymentIntentId?: string,
    stripeChargeId?: string
  ): Promise<void> {
    await pool.query(
      `UPDATE payments
       SET status = $1, stripe_payment_intent_id = $2, stripe_charge_id = $3
       WHERE id = $4`,
      [status, stripePaymentIntentId, stripeChargeId, id]
    );
  }

  private static mapRow(row: any): Payment {
    return {
      id: row.id,
      bookingId: row.booking_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      stripePaymentIntentId: row.stripe_payment_intent_id,
      stripeChargeId: row.stripe_charge_id,
      platformFee: parseFloat(row.platform_fee),
      instructorPayout: parseFloat(row.instructor_payout),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
