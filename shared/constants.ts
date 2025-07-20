// Shared constants for the ski/snowboard instructor booking system

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SEARCH: '/search',
  BOOKINGS: '/bookings',
  AVAILABILITY: '/availability',
  ANALYTICS: '/analytics',
  ADMIN: '/admin',
  INSTRUCTOR_PROFILE: (id: string) => `/instructors/${id}`,
  BOOKING_DETAILS: (id: string) => `/bookings/${id}`,
  BOOK_LESSON: (instructorId: string) => `/book/${instructorId}`,
} as const;

// Business Rules
export const BUSINESS_RULES = {
  // Booking rules
  MIN_BOOKING_HOURS: 1,
  MAX_BOOKING_HOURS: 8,
  MIN_ADVANCE_BOOKING_HOURS: 2,
  MAX_ADVANCE_BOOKING_DAYS: 90,
  
  // Group size limits
  MIN_GROUP_SIZE: 1,
  MAX_GROUP_SIZE: 6,
  
  // Pricing
  BASE_COMMISSION_RATE: 0.15, // 15%
  TIP_PERCENTAGE_OPTIONS: [10, 15, 20, 25],
  
  // Cancellation
  FREE_CANCELLATION_HOURS: 24,
  PARTIAL_REFUND_HOURS: 12,
  
  // Rating
  MIN_RATING: 1,
  MAX_RATING: 5,
  
  // Profile limits
  MAX_BIO_LENGTH: 500,
  MAX_SPECIALTIES: 10,
  MAX_CERTIFICATIONS: 20,
  MAX_PHOTOS: 10,
  MAX_VIDEOS: 5,
  
  // Availability
  MIN_SLOT_DURATION_MINUTES: 60,
  MAX_DAILY_HOURS: 10,
  
  // Weather thresholds
  MIN_VISIBILITY_METERS: 30,
  MAX_WIND_SPEED_KMH: 50,
  MIN_OPERATING_TEMP_C: -25,
  MAX_OPERATING_TEMP_C: 5,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  
  // Debounce delays
  SEARCH_DEBOUNCE_MS: 300,
  FILTER_DEBOUNCE_MS: 500,
  
  // Animation durations
  FAST_ANIMATION_MS: 150,
  NORMAL_ANIMATION_MS: 300,
  SLOW_ANIMATION_MS: 500,
  
  // Toast notifications
  TOAST_DURATION_MS: 4000,
  ERROR_TOAST_DURATION_MS: 6000,
  
  // Auto-refresh intervals
  DASHBOARD_REFRESH_MS: 30000,
  BOOKING_STATUS_REFRESH_MS: 10000,
  WEATHER_REFRESH_MS: 300000, // 5 minutes
  
  // File upload
  MAX_FILE_SIZE_MB: 10,
  MAX_VIDEO_SIZE_MB: 100,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

// Colors (Tailwind CSS classes)
export const COLORS = {
  PRIMARY: 'blue',
  SECONDARY: 'gray',
  SUCCESS: 'green',
  WARNING: 'yellow',
  ERROR: 'red',
  INFO: 'blue',
  
  // Skill levels
  BEGINNER: 'green',
  INTERMEDIATE: 'blue',
  ADVANCED: 'orange',
  EXPERT: 'red',
  
  // Activities
  SKIING: 'blue',
  SNOWBOARDING: 'purple',
  BOTH: 'indigo',
  
  // Status colors
  PENDING: 'yellow',
  CONFIRMED: 'green',
  IN_PROGRESS: 'blue',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  NO_SHOW: 'orange',
} as const;

// Time zones
export const TIME_ZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
] as const;

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
] as const;

// Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
] as const;

// Skill level progression
export const SKILL_PROGRESSION = {
  beginner: {
    name: 'Beginner',
    description: 'Learning basic techniques',
    prerequisites: [],
    goals: ['Basic turns', 'Speed control', 'Stopping'],
    averageLessons: 5,
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Comfortable on most terrain',
    prerequisites: ['Basic turns', 'Speed control'],
    goals: ['Parallel turns', 'Varied terrain', 'Carved turns'],
    averageLessons: 10,
  },
  advanced: {
    name: 'Advanced',
    description: 'Confident on challenging terrain',
    prerequisites: ['Parallel turns', 'Varied terrain'],
    goals: ['Advanced carving', 'Moguls', 'Steeps'],
    averageLessons: 15,
  },
  expert: {
    name: 'Expert',
    description: 'Masters all terrain and conditions',
    prerequisites: ['Advanced techniques', 'All terrain'],
    goals: ['Perfect technique', 'Teaching others', 'Competition'],
    averageLessons: 20,
  },
} as const;

// Weather conditions
export const WEATHER_CONDITIONS = {
  EXCELLENT: {
    name: 'Excellent',
    description: 'Perfect conditions for skiing',
    color: 'green',
    emoji: '☀️',
  },
  GOOD: {
    name: 'Good',
    description: 'Great conditions for most activities',
    color: 'blue',
    emoji: '⛅',
  },
  FAIR: {
    name: 'Fair',
    description: 'Acceptable conditions',
    color: 'yellow',
    emoji: '🌤️',
  },
  POOR: {
    name: 'Poor',
    description: 'Challenging conditions',
    color: 'orange',
    emoji: '🌨️',
  },
  DANGEROUS: {
    name: 'Dangerous',
    description: 'Unsafe conditions',
    color: 'red',
    emoji: '⛈️',
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  BOOKING_CONFLICT: 'This time slot is no longer available.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  EXPIRED_SESSION: 'Your session has expired. Please log in again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_UPDATED: 'Booking updated successfully!',
  BOOKING_CANCELLED: 'Booking cancelled successfully.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  AVAILABILITY_UPDATED: 'Availability updated successfully!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ACCOUNT_VERIFIED: 'Account verified successfully!',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  SEARCH_FILTERS: 'search_filters',
  DRAFT_BOOKING: 'draft_booking',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_TIPS: true,
  ENABLE_GROUP_BOOKINGS: true,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_AI_MATCHING: true,
  ENABLE_WEATHER_ALERTS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Users
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  
  // Instructors
  INSTRUCTORS: '/instructors',
  INSTRUCTOR_PROFILE: (id: string) => `/instructors/${id}`,
  INSTRUCTOR_AVAILABILITY: (id: string) => `/instructors/${id}/availability`,
  INSTRUCTOR_REVIEWS: (id: string) => `/instructors/${id}/reviews`,
  
  // Bookings
  BOOKINGS: '/bookings',
  CREATE_BOOKING: '/bookings',
  BOOKING_DETAILS: (id: string) => `/bookings/${id}`,
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,
  
  // Payments
  PAYMENT_INTENT: '/payments/intent',
  PROCESS_PAYMENT: '/payments/process',
  REFUND_PAYMENT: '/payments/refund',
  
  // Analytics
  ANALYTICS: '/analytics',
  INSTRUCTOR_ANALYTICS: '/analytics/instructor',
  RESORT_ANALYTICS: '/analytics/resort',
  
  // Weather
  WEATHER: '/weather',
  WEATHER_ALERTS: '/weather/alerts',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const;