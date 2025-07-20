// Shared utility functions for the ski/snowboard instructor booking system

import { SkillLevel, Activity, UserRole, BookingStatus, WeatherConditions } from './types';

/**
 * Format currency values consistently across the platform
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format dates for display
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Format time for display
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

/**
 * Calculate duration between two dates in hours
 */
export const calculateDuration = (startTime: Date | string, endTime: Date | string): number => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

/**
 * Get skill level display name with color
 */
export const getSkillLevelInfo = (level: SkillLevel) => {
  const skillLevels = {
    [SkillLevel.BEGINNER]: { name: 'Beginner', color: 'green', description: 'New to the sport' },
    [SkillLevel.INTERMEDIATE]: { name: 'Intermediate', color: 'blue', description: 'Comfortable on most terrain' },
    [SkillLevel.ADVANCED]: { name: 'Advanced', color: 'orange', description: 'Confident on challenging terrain' },
    [SkillLevel.EXPERT]: { name: 'Expert', color: 'red', description: 'Masters all terrain and conditions' },
  };
  
  return skillLevels[level];
};

/**
 * Get activity display information
 */
export const getActivityInfo = (activity: Activity) => {
  const activities = {
    [Activity.SKIING]: { name: 'Skiing', icon: '⛷️', color: 'blue' },
    [Activity.SNOWBOARDING]: { name: 'Snowboarding', icon: '🏂', color: 'purple' },
    [Activity.BOTH]: { name: 'Ski & Snowboard', icon: '🎿', color: 'indigo' },
  };
  
  return activities[activity];
};

/**
 * Get user role display information
 */
export const getUserRoleInfo = (role: UserRole) => {
  const roles = {
    [UserRole.CLIENT]: { name: 'Client', color: 'green', permissions: ['book_lessons', 'view_profile'] },
    [UserRole.INSTRUCTOR]: { name: 'Instructor', color: 'blue', permissions: ['manage_availability', 'view_bookings', 'update_profile'] },
    [UserRole.RESORT_ADMIN]: { name: 'Resort Admin', color: 'orange', permissions: ['manage_instructors', 'view_analytics', 'manage_resort'] },
    [UserRole.SUPER_ADMIN]: { name: 'Super Admin', color: 'red', permissions: ['full_access'] },
  };
  
  return roles[role];
};

/**
 * Get booking status information
 */
export const getBookingStatusInfo = (status: BookingStatus) => {
  const statuses = {
    [BookingStatus.PENDING]: { name: 'Pending', color: 'yellow', description: 'Waiting for confirmation' },
    [BookingStatus.CONFIRMED]: { name: 'Confirmed', color: 'green', description: 'Lesson confirmed' },
    [BookingStatus.IN_PROGRESS]: { name: 'In Progress', color: 'blue', description: 'Lesson currently happening' },
    [BookingStatus.COMPLETED]: { name: 'Completed', color: 'gray', description: 'Lesson finished' },
    [BookingStatus.CANCELLED]: { name: 'Cancelled', color: 'red', description: 'Lesson cancelled' },
    [BookingStatus.NO_SHOW]: { name: 'No Show', color: 'orange', description: 'Client did not show up' },
  };
  
  return statuses[status];
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
};

/**
 * Get weather condition emoji
 */
export const getWeatherEmoji = (conditions: Partial<WeatherConditions>): string => {
  if (!conditions.snowConditions) return '❄️';
  
  const condition = conditions.snowConditions.toLowerCase();
  
  if (condition.includes('powder')) return '💨';
  if (condition.includes('fresh')) return '❄️';
  if (condition.includes('packed')) return '🏔️';
  if (condition.includes('icy')) return '🧊';
  if (condition.includes('slushy')) return '💧';
  
  return '❄️';
};

/**
 * Calculate distance between two coordinates
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateObj);
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate initials from a name
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole: UserRole, requiredPermission: string): boolean => {
  const roleInfo = getUserRoleInfo(userRole);
  return roleInfo.permissions.includes(requiredPermission) || 
         roleInfo.permissions.includes('full_access');
};

/**
 * Sort array by multiple criteria
 */
export const multiSort = <T>(
  array: T[],
  sorts: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] => {
  return [...array].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      
      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;
      
      if (comparison !== 0) {
        return sort.direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
};

/**
 * Group array by key
 */
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  return obj == null || 
         (typeof obj === 'string' && obj.trim() === '') ||
         (Array.isArray(obj) && obj.length === 0) ||
         (typeof obj === 'object' && Object.keys(obj).length === 0);
};