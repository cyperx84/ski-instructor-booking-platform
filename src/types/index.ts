export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor extends User {
  bio?: string;
  specialties: SkiSpecialty[];
  certifications: string[];
  experience: number; // years
  hourlyRate: number;
  languages: string[];
  profileImage?: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  preferredLocations: string[];
}

export interface Client extends User {
  skillLevel: SkillLevel;
  preferredLanguage?: string;
  emergencyContact?: EmergencyContact;
  medicalNotes?: string;
  previousLessons?: string[];
}

export interface Booking {
  id: string;
  clientId: string;
  instructorId: string;
  lessonType: LessonType;
  skillLevel: SkillLevel;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  location: string;
  status: BookingStatus;
  totalAmount: number;
  commissionAmount: number;
  specialRequests?: string;
  equipmentNeeded: boolean;
  groupSize: number;
  clientNotes?: string;
  instructorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Availability {
  id: string;
  instructorId: string;
  date: Date;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  instructorId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  processedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  CLIENT = 'client',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum SkiSpecialty {
  ALPINE_SKIING = 'alpine_skiing',
  SNOWBOARDING = 'snowboarding',
  FREESTYLE = 'freestyle',
  RACING = 'racing',
  BACKCOUNTRY = 'backcountry',
  CROSS_COUNTRY = 'cross_country',
  TELEMARK = 'telemark',
  ADAPTIVE = 'adaptive'
}

export enum LessonType {
  PRIVATE = 'private',
  GROUP = 'group',
  FAMILY = 'family',
  CORPORATE = 'corporate'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED_BY_CLIENT = 'cancelled_by_client',
  CANCELLED_BY_INSTRUCTOR = 'cancelled_by_instructor',
  NO_SHOW = 'no_show'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum RecurringPattern {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

// Supporting interfaces
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  skillLevel?: SkillLevel;
  specialty?: SkiSpecialty;
  location?: string;
  dateFrom?: Date;
  dateTo?: Date;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  language?: string;
}

// Validation types for request data
export interface RegisterRequestData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface LoginRequestData {
  email: string;
  password: string;
}

export interface UpdateProfileRequestData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}