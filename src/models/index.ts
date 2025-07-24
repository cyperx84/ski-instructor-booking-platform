// Export all models for easy importing
export { BaseModel } from './BaseModel';
export { User, UserData, CreateUserData } from './User';
export { Instructor, InstructorProfileData, CreateInstructorData, InstructorSearchFilters } from './Instructor';
export { Booking, BookingData, CreateBookingData, BookingSearchFilters } from './Booking';
export { Payment, PaymentMethod, PaymentMethodData, TransactionData, CreateTransactionData, PaymentStatus, TransactionType } from './Payment';

// Create and export model instances for easy use
import { User } from './User';
import { Instructor } from './Instructor';
import { Booking } from './Booking';
import { Payment, PaymentMethod } from './Payment';

export const userModel = new User();
export const instructorModel = new Instructor();
export const bookingModel = new Booking();
export const paymentModel = new Payment();
export const paymentMethodModel = new PaymentMethod();