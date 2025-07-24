// Export all services for easy importing
export { BaseService } from './BaseService';
export { AuthService } from './AuthService';
export { InstructorService } from './InstructorService';
export { BookingService } from './BookingService';
export { PaymentService } from './PaymentService';

// Create and export service instances for easy use
import { AuthService } from './AuthService';
import { InstructorService } from './InstructorService';
import { BookingService } from './BookingService';
import { PaymentService } from './PaymentService';

export const authService = new AuthService();
export const instructorService = new InstructorService();
export const bookingService = new BookingService();
export const paymentService = new PaymentService();