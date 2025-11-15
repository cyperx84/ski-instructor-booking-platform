// Shared TypeScript types for snowboard instructor booking MVP

export enum UserRole {
  CLIENT = 'client',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export enum Activity {
  SNOWBOARDING = 'snowboarding',
  SKIING = 'skiing'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface User {
  id: string;
  email: string;
  password?: string; // Hashed, only for backend
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor {
  id: string;
  userId: string;
  bio: string;
  specialties: Activity[];
  hourlyRate: number;
  yearsExperience: number;
  certifications: string[];
  profileImage?: string;
  rating: number;
  totalLessons: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  id: string;
  instructorId: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  createdAt: Date;
}

export interface Booking {
  id: string;
  clientId: string;
  instructorId: string;
  availabilitySlotId: string;
  activity: Activity;
  skillLevel: SkillLevel;
  status: BookingStatus;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  totalPrice: number;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  platformFee: number;
  instructorPayout: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface CreateInstructorRequest {
  bio: string;
  specialties: Activity[];
  hourlyRate: number;
  yearsExperience: number;
  certifications: string[];
}

export interface CreateAvailabilityRequest {
  startTime: string;
  endTime: string;
}

export interface CreateBookingRequest {
  instructorId: string;
  availabilitySlotId: string;
  activity: Activity;
  skillLevel: SkillLevel;
  specialRequests?: string;
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
}

export interface SearchInstructorsQuery {
  activity?: Activity;
  minRate?: number;
  maxRate?: number;
  date?: string;
  minRating?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Instructor with user details (joined)
export interface InstructorWithUser extends Instructor {
  user: Omit<User, 'password'>;
}

// Booking with related data
export interface BookingWithDetails extends Booking {
  instructor: InstructorWithUser;
  client: Omit<User, 'password'>;
}
