import { Router } from 'express';
import { BookingModel } from '../models/Booking';
import { InstructorModel } from '../models/Instructor';
import { PaymentModel } from '../models/Payment';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { UserRole, BookingStatus } from '../../../shared/types';
import { pool } from '../config/database';

const router = Router();

// Get instructor's dashboard data
router.get(
  '/dashboard',
  authenticateToken,
  requireRole(UserRole.INSTRUCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // Get instructor profile
      const instructor = await InstructorModel.findByUserId(req.user.id);
      if (!instructor) {
        throw new AppError('Instructor profile not found', 404);
      }

      // Get all bookings
      const bookings = await BookingModel.findByInstructor(instructor.id);

      // Calculate stats
      const now = new Date();
      const upcomingBookings = bookings.filter(
        (b) => new Date(b.startTime) > now && b.status !== BookingStatus.CANCELLED
      );
      const pastBookings = bookings.filter(
        (b) => new Date(b.startTime) <= now || b.status === BookingStatus.COMPLETED
      );
      const totalEarnings = bookings
        .filter((b) => b.status === BookingStatus.COMPLETED)
        .reduce((sum, b) => sum + b.totalPrice, 0);

      // Calculate payout (85% after 15% platform fee)
      const instructorPayout = totalEarnings * 0.85;

      // Get monthly earnings
      const monthlyResult = await pool.query(
        `SELECT
          DATE_TRUNC('month', start_time) as month,
          COUNT(*) as booking_count,
          SUM(total_price) as revenue
         FROM bookings
         WHERE instructor_id = $1 AND status = 'completed'
         GROUP BY DATE_TRUNC('month', start_time)
         ORDER BY month DESC
         LIMIT 12`,
        [instructor.id]
      );

      const monthlyEarnings = monthlyResult.rows.map((row) => ({
        month: row.month,
        bookingCount: parseInt(row.booking_count),
        revenue: parseFloat(row.revenue),
        payout: parseFloat(row.revenue) * 0.85,
      }));

      res.json({
        success: true,
        data: {
          instructor,
          stats: {
            totalBookings: bookings.length,
            upcomingBookings: upcomingBookings.length,
            completedBookings: pastBookings.filter((b) => b.status === BookingStatus.COMPLETED)
              .length,
            totalEarnings,
            instructorPayout,
            averageRating: instructor.rating,
          },
          monthlyEarnings,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get instructor's bookings with filters
router.get(
  '/bookings',
  authenticateToken,
  requireRole(UserRole.INSTRUCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const instructor = await InstructorModel.findByUserId(req.user.id);
      if (!instructor) {
        throw new AppError('Instructor profile not found', 404);
      }

      const { status, timeframe } = req.query;

      let query = `
        SELECT
          b.*,
          u.id as client_user_id, u.email as client_email,
          u.first_name as client_first_name, u.last_name as client_last_name,
          u.phone_number as client_phone
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        WHERE b.instructor_id = $1
      `;
      const params: any[] = [instructor.id];
      let paramCount = 2;

      if (status) {
        query += ` AND b.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (timeframe === 'upcoming') {
        query += ` AND b.start_time > NOW() AND b.status != 'cancelled'`;
      } else if (timeframe === 'past') {
        query += ` AND (b.start_time <= NOW() OR b.status IN ('completed', 'cancelled'))`;
      }

      query += ' ORDER BY b.start_time DESC';

      const result = await pool.query(query, params);

      const bookings = result.rows.map((row) => ({
        id: row.id,
        clientId: row.client_id,
        instructorId: row.instructor_id,
        availabilitySlotId: row.availability_slot_id,
        activity: row.activity,
        skillLevel: row.skill_level,
        status: row.status,
        startTime: row.start_time,
        endTime: row.end_time,
        durationHours: parseFloat(row.duration_hours),
        totalPrice: parseFloat(row.total_price),
        specialRequests: row.special_requests,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        client: {
          id: row.client_user_id,
          email: row.client_email,
          firstName: row.client_first_name,
          lastName: row.client_last_name,
          phoneNumber: row.client_phone,
        },
      }));

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Mark booking as complete
router.patch(
  '/bookings/:id/complete',
  authenticateToken,
  requireRole(UserRole.INSTRUCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const instructor = await InstructorModel.findByUserId(req.user.id);
      if (!instructor) {
        throw new AppError('Instructor profile not found', 404);
      }

      const booking = await BookingModel.findById(req.params.id);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.instructorId !== instructor.id) {
        throw new AppError('Unauthorized to modify this booking', 403);
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new AppError('Only confirmed bookings can be marked as complete', 400);
      }

      await BookingModel.updateStatus(req.params.id, BookingStatus.COMPLETED);
      await InstructorModel.incrementLessons(instructor.id);

      res.json({
        success: true,
        message: 'Booking marked as complete',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get earnings summary
router.get(
  '/earnings',
  authenticateToken,
  requireRole(UserRole.INSTRUCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const instructor = await InstructorModel.findByUserId(req.user.id);
      if (!instructor) {
        throw new AppError('Instructor profile not found', 404);
      }

      // Get all completed bookings with payments
      const result = await pool.query(
        `SELECT
          b.id as booking_id,
          b.start_time,
          b.duration_hours,
          b.total_price,
          p.amount as payment_amount,
          p.platform_fee,
          p.instructor_payout,
          p.status as payment_status,
          u.first_name || ' ' || u.last_name as client_name
         FROM bookings b
         LEFT JOIN payments p ON b.id = p.booking_id
         JOIN users u ON b.client_id = u.id
         WHERE b.instructor_id = $1 AND b.status = 'completed'
         ORDER BY b.start_time DESC`,
        [instructor.id]
      );

      const earnings = result.rows.map((row) => ({
        bookingId: row.booking_id,
        startTime: row.start_time,
        durationHours: parseFloat(row.duration_hours),
        totalPrice: parseFloat(row.total_price),
        platformFee: row.platform_fee ? parseFloat(row.platform_fee) : 0,
        instructorPayout: row.instructor_payout ? parseFloat(row.instructor_payout) : 0,
        paymentStatus: row.payment_status,
        clientName: row.client_name,
      }));

      const totalPayout = earnings.reduce((sum, e) => sum + e.instructorPayout, 0);
      const totalRevenue = earnings.reduce((sum, e) => sum + e.totalPrice, 0);
      const totalFees = earnings.reduce((sum, e) => sum + e.platformFee, 0);

      res.json({
        success: true,
        data: {
          earnings,
          summary: {
            totalRevenue,
            totalPayout,
            totalFees,
            completedBookings: earnings.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
