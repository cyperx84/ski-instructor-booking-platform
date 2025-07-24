import { BaseService } from './BaseService';
import { bookingModel, instructorModel, userModel } from '@/models';
import { CreateBookingData, BookingSearchFilters } from '@/models/Booking';
import { BookingStatus } from '@/types';
import { AppError } from '@/middleware/error';

export class BookingService extends BaseService {
  constructor() {
    super('BookingService');
  }

  /**
   * Create a new booking
   */
  async createBooking(bookingData: CreateBookingData): Promise<any> {
    try {
      this.log('info', 'Creating new booking', { 
        clientId: bookingData.client_id,
        instructorId: bookingData.instructor_id,
        lessonDate: bookingData.lesson_date
      });

      // Validate required fields
      this.validateRequired(bookingData, [
        'client_id', 'instructor_id', 'resort_id', 'lesson_type', 
        'skill_level', 'lesson_date', 'start_time', 'end_time',
        'duration_hours', 'hourly_rate', 'total_amount'
      ]);

      // Check if client exists
      const client = await userModel.findById(bookingData.client_id);
      if (!client || client.role !== 'client') {
        throw new AppError('Client not found', 404);
      }

      // Check if instructor exists
      const instructor = await instructorModel.findById(bookingData.instructor_id);
      if (!instructor) {
        throw new AppError('Instructor not found', 404);
      }

      // Check instructor availability
      const isAvailable = await bookingModel.checkInstructorAvailability(
        bookingData.instructor_id,
        bookingData.lesson_date,
        bookingData.start_time,
        bookingData.end_time
      );

      if (!isAvailable) {
        throw new AppError('Instructor is not available at the requested time', 409);
      }

      // Validate booking duration and rate
      if (bookingData.duration_hours < instructor.minimum_booking_hours) {
        throw new AppError(
          `Minimum booking duration is ${instructor.minimum_booking_hours} hours`,
          400
        );
      }

      if (bookingData.duration_hours > instructor.maximum_booking_hours) {
        throw new AppError(
          `Maximum booking duration is ${instructor.maximum_booking_hours} hours`,
          400
        );
      }

      // Create booking
      const booking = await bookingModel.createBooking(bookingData);

      // Get booking with details
      const bookingWithDetails = await bookingModel.getBookingWithDetails(booking.id);

      this.log('info', 'Booking created successfully', { bookingId: booking.id });

      return bookingWithDetails;

    } catch (error) {
      this.handleError(error, 'createBooking');
    }
  }

  /**
   * Get booking by ID with details
   */
  async getBookingById(bookingId: string): Promise<any> {
    try {
      this.log('info', 'Fetching booking by ID', { bookingId });

      const booking = await bookingModel.getBookingWithDetails(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      return booking;

    } catch (error) {
      this.handleError(error, 'getBookingById');
    }
  }

  /**
   * Search bookings with filters
   */
  async searchBookings(
    filters: BookingSearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    bookings: any[];
    pagination: any;
  }> {
    try {
      this.log('info', 'Searching bookings', { filters, limit, offset });

      const bookings = await bookingModel.searchBookings(filters, limit, offset);
      
      // Get total count for pagination (simplified)
      const total = await bookingModel.count();

      const pagination = this.createPaginationInfo(total, limit, offset);

      return {
        bookings,
        pagination
      };

    } catch (error) {
      this.handleError(error, 'searchBookings');
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    userId?: string
  ): Promise<any> {
    try {
      this.log('info', 'Updating booking status', { bookingId, status, userId });

      // Check if booking exists
      const existingBooking = await bookingModel.findById(bookingId);
      if (!existingBooking) {
        throw new AppError('Booking not found', 404);
      }

      // Validate status transitions
      if (!this.isValidStatusTransition(existingBooking.status, status)) {
        throw new AppError(`Cannot change status from ${existingBooking.status} to ${status}`, 400);
      }

      // Update booking status
      const updatedBooking = await bookingModel.updateStatus(bookingId, status, userId);

      // Perform additional actions based on status
      if (status === 'confirmed') {
        await this.handleBookingConfirmation(bookingId);
      } else if (status === 'completed') {
        await this.handleBookingCompletion(bookingId);
      } else if (status === 'cancelled_by_client' || status === 'cancelled_by_instructor') {
        await this.handleBookingCancellation(bookingId);
      }

      // Get updated booking with details
      const bookingWithDetails = await bookingModel.getBookingWithDetails(bookingId);

      this.log('info', 'Booking status updated successfully', { bookingId, status });

      return bookingWithDetails;

    } catch (error) {
      this.handleError(error, 'updateBookingStatus');
    }
  }

  /**
   * Cancel booking with reason
   */
  async cancelBooking(
    bookingId: string,
    reason: string,
    cancelledBy: string
  ): Promise<any> {
    try {
      this.log('info', 'Cancelling booking', { bookingId, reason, cancelledBy });

      // Check if booking exists and can be cancelled
      const booking = await bookingModel.findById(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (!['pending', 'confirmed'].includes(booking.status as string)) {
        throw new AppError('Booking cannot be cancelled in its current status', 400);
      }

      // Cancel booking
      const cancelledBooking = await bookingModel.cancelBooking(bookingId, reason, cancelledBy);

      // Handle cancellation side effects
      await this.handleBookingCancellation(bookingId);

      // Get updated booking with details
      const bookingWithDetails = await bookingModel.getBookingWithDetails(bookingId);

      this.log('info', 'Booking cancelled successfully', { bookingId });

      return bookingWithDetails;

    } catch (error) {
      this.handleError(error, 'cancelBooking');
    }
  }

  /**
   * Add instructor notes to booking
   */
  async addInstructorNotes(bookingId: string, notes: string, instructorId: string): Promise<any> {
    try {
      this.log('info', 'Adding instructor notes', { bookingId, instructorId });

      // Verify instructor ownership
      const booking = await bookingModel.findById(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.instructor_id !== instructorId) {
        throw new AppError('Not authorized to add notes to this booking', 403);
      }

      // Add notes
      const updatedBooking = await bookingModel.addInstructorNotes(bookingId, notes);

      this.log('info', 'Instructor notes added successfully', { bookingId });

      return updatedBooking;

    } catch (error) {
      this.handleError(error, 'addInstructorNotes');
    }
  }

  /**
   * Add client notes to booking
   */
  async addClientNotes(bookingId: string, notes: string, clientId: string): Promise<any> {
    try {
      this.log('info', 'Adding client notes', { bookingId, clientId });

      // Verify client ownership
      const booking = await bookingModel.findById(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404);
      }

      if (booking.client_id !== clientId) {
        throw new AppError('Not authorized to add notes to this booking', 403);
      }

      // Add notes
      const updatedBooking = await bookingModel.addClientNotes(bookingId, notes);

      this.log('info', 'Client notes added successfully', { bookingId });

      return updatedBooking;

    } catch (error) {
      this.handleError(error, 'addClientNotes');
    }
  }

  /**
   * Get upcoming bookings for instructor
   */
  async getUpcomingBookingsForInstructor(
    instructorId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      this.log('info', 'Fetching upcoming bookings for instructor', { instructorId, limit });

      const bookings = await bookingModel.getUpcomingBookingsForInstructor(instructorId, limit);

      return bookings;

    } catch (error) {
      this.handleError(error, 'getUpcomingBookingsForInstructor');
    }
  }

  /**
   * Get booking history for client
   */
  async getBookingHistoryForClient(
    clientId: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      this.log('info', 'Fetching booking history for client', { clientId, limit });

      const bookings = await bookingModel.getBookingHistoryForClient(clientId, limit);

      return bookings;

    } catch (error) {
      this.handleError(error, 'getBookingHistoryForClient');
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(
    startDate: Date,
    endDate: Date,
    instructorId?: string
  ): Promise<any> {
    try {
      this.log('info', 'Fetching booking statistics', { startDate, endDate, instructorId });

      const stats = await bookingModel.getBookingStats(startDate, endDate, instructorId);

      return stats;

    } catch (error) {
      this.handleError(error, 'getBookingStats');
    }
  }

  /**
   * Get bookings requiring attention
   */
  async getBookingsRequiringAttention(instructorId?: string): Promise<any[]> {
    try {
      this.log('info', 'Fetching bookings requiring attention', { instructorId });

      const bookings = await bookingModel.getBookingsRequiringAttention(instructorId);

      return bookings;

    } catch (error) {
      this.handleError(error, 'getBookingsRequiringAttention');
    }
  }

  /**
   * Check instructor availability
   */
  async checkAvailability(
    instructorId: string,
    lessonDate: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<{ available: boolean }> {
    try {
      this.log('info', 'Checking instructor availability', { 
        instructorId, lessonDate, startTime, endTime 
      });

      const available = await bookingModel.checkInstructorAvailability(
        instructorId,
        lessonDate,
        startTime,
        endTime,
        excludeBookingId
      );

      return { available };

    } catch (error) {
      this.handleError(error, 'checkAvailability');
    }
  }

  // Private helper methods

  private isValidStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled_by_client', 'cancelled_by_instructor'],
      'confirmed': ['completed', 'in_progress', 'cancelled_by_client', 'cancelled_by_instructor', 'no_show'],
      'in_progress': ['completed', 'cancelled_by_instructor'],
      'cancelled_by_client': [], // No transitions from cancelled
      'cancelled_by_instructor': [], // No transitions from cancelled
      'completed': [], // No transitions from completed
      'no_show': []    // No transitions from no_show
    };

    return validTransitions[currentStatus as string]?.includes(newStatus as string) || false;
  }

  private async handleBookingConfirmation(bookingId: string): Promise<void> {
    try {
      // Update instructor acceptance rate (assuming confirmation means acceptance)
      const booking = await bookingModel.findById(bookingId);
      if (booking) {
        await instructorModel.updateAcceptanceRate(booking.instructor_id, true);
      }

      this.log('info', 'Booking confirmation handled', { bookingId });

    } catch (error) {
      this.log('error', 'Error handling booking confirmation', { bookingId, error: error.message });
    }
  }

  private async handleBookingCompletion(bookingId: string): Promise<void> {
    try {
      // Increment instructor lesson count
      const booking = await bookingModel.findById(bookingId);
      if (booking) {
        await instructorModel.incrementLessonCount(booking.instructor_id);
      }

      this.log('info', 'Booking completion handled', { bookingId });

    } catch (error) {
      this.log('error', 'Error handling booking completion', { bookingId, error: error.message });
    }
  }

  private async handleBookingCancellation(bookingId: string): Promise<void> {
    try {
      // Update instructor acceptance rate if needed
      const booking = await bookingModel.findById(bookingId);
      if (booking && booking.status === 'pending') {
        await instructorModel.updateAcceptanceRate(booking.instructor_id, false);
      }

      this.log('info', 'Booking cancellation handled', { bookingId });

    } catch (error) {
      this.log('error', 'Error handling booking cancellation', { bookingId, error: error.message });
    }
  }
}