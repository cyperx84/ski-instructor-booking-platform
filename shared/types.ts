// Shared TypeScript types for the ski/snowboard instructor booking system

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CLIENT = 'client',
  INSTRUCTOR = 'instructor',
  RESORT_ADMIN = 'resort_admin',
  SUPER_ADMIN = 'super_admin'
}

export interface Instructor extends User {
  certifications: Certification[];
  specialties: Specialty[];
  languages: string[];
  baseRate: number;
  rating: number;
  totalReviews: number;
  bio: string;
  experience: number;
  profileVerified: boolean;
  availability: AvailabilitySlot[];
}

export interface Client extends User {
  skillLevel: SkillLevel;
  preferences: ClientPreferences;
  emergencyContact: EmergencyContact;
}

export interface Booking {
  id: string;
  instructorId: string;
  clientId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  activity: Activity;
  groupSize: number;
  totalPrice: number;
  location: Location;
  specialRequests?: string;
  weatherConditions?: WeatherConditions;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum Activity {
  SKIING = 'skiing',
  SNOWBOARDING = 'snowboarding',
  BOTH = 'both'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  level: string;
  expiryDate: Date;
  verified: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  category: SpecialtyCategory;
}

export enum SpecialtyCategory {
  TECHNIQUE = 'technique',
  TERRAIN = 'terrain',
  AGE_GROUP = 'age_group',
  ADAPTIVE = 'adaptive'
}

export interface AvailabilitySlot {
  id: string;
  instructorId: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  isBooked: boolean;
  minGroupSize: number;
  maxGroupSize: number;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: LocationType;
}

export enum LocationType {
  RESORT = 'resort',
  MOUNTAIN = 'mountain',
  SLOPE = 'slope',
  MEETING_POINT = 'meeting_point'
}

export interface WeatherConditions {
  temperature: number;
  snowConditions: string;
  visibility: string;
  windSpeed: number;
  forecast: string;
  avalancheRisk?: string;
}

export interface ClientPreferences {
  preferredInstructorGender?: 'male' | 'female' | 'no_preference';
  preferredLanguages: string[];
  learningStyle: LearningStyle;
  fitnessLevel: FitnessLevel;
  previousExperience: string;
  goals: string[];
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  MIXED = 'mixed'
}

export enum FitnessLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  ATHLETIC = 'athletic'
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  instructorId: string;
  rating: number;
  comment: string;
  categories: ReviewCategory[];
  createdAt: Date;
}

export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  commissionAmount: number;
  instructorPayout: number;
  tipAmount?: number;
  createdAt: Date;
  processedAt?: Date;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  activity?: Activity;
  skillLevel?: SkillLevel;
  date?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  specialties?: string[];
  languages?: string[];
  groupSize?: number;
}

export interface BookingRequest {
  instructorId: string;
  startTime: Date;
  endTime: Date;
  activity: Activity;
  groupSize: number;
  specialRequests?: string;
  clientInfo: {
    skillLevel: SkillLevel;
    previousExperience: string;
    goals: string[];
  };
}

export interface InstructorMatch {
  instructor: Instructor;
  compatibilityScore: number;
  reasons: string[];
  availability: AvailabilitySlot[];
  estimatedPrice: number;
}

export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  cancellationRate: number;
  topInstructors: Instructor[];
  popularTimes: TimeSlot[];
  monthlyTrends: MonthlyData[];
}

export interface TimeSlot {
  hour: number;
  bookingCount: number;
}

export interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
}

// Utility types for API endpoints
export type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserRequest = Partial<CreateUserRequest>;
export type CreateBookingRequest = Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
export type UpdateBookingRequest = Partial<Pick<Booking, 'startTime' | 'endTime' | 'specialRequests'>>;

// Event types for real-time updates
export interface BookingEvent {
  type: 'booking_created' | 'booking_updated' | 'booking_cancelled';
  bookingId: string;
  data: Partial<Booking>;
  timestamp: Date;
}

export interface NotificationEvent {
  type: 'booking_reminder' | 'weather_alert' | 'message_received';
  userId: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}