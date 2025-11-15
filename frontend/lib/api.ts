import axios from 'axios';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
  InstructorWithUser,
  SearchInstructorsQuery,
  CreateBookingRequest,
  Booking,
  BookingWithDetails,
  CreatePaymentIntentRequest,
  AvailabilitySlot,
  CreateAvailabilityRequest,
} from '../../shared/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

// Instructors
export const searchInstructors = async (
  filters: SearchInstructorsQuery
): Promise<InstructorWithUser[]> => {
  const response = await api.get<ApiResponse<InstructorWithUser[]>>('/instructors/search', {
    params: filters,
  });
  return response.data.data!;
};

export const getInstructor = async (id: string): Promise<InstructorWithUser> => {
  const response = await api.get<ApiResponse<InstructorWithUser>>(`/instructors/${id}`);
  return response.data.data!;
};

export const getInstructorAvailability = async (
  instructorId: string,
  date?: string
): Promise<AvailabilitySlot[]> => {
  const response = await api.get<ApiResponse<AvailabilitySlot[]>>(
    `/instructors/${instructorId}/availability`,
    { params: { date } }
  );
  return response.data.data!;
};

export const createAvailability = async (
  instructorId: string,
  data: CreateAvailabilityRequest
): Promise<AvailabilitySlot> => {
  const response = await api.post<ApiResponse<AvailabilitySlot>>(
    `/instructors/${instructorId}/availability`,
    data
  );
  return response.data.data!;
};

// Bookings
export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const response = await api.post<ApiResponse<Booking>>('/bookings', data);
  return response.data.data!;
};

export const getBooking = async (id: string): Promise<BookingWithDetails> => {
  const response = await api.get<ApiResponse<BookingWithDetails>>(`/bookings/${id}`);
  return response.data.data!;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await api.get<ApiResponse<Booking[]>>('/bookings/user/my-bookings');
  return response.data.data!;
};

export const cancelBooking = async (id: string): Promise<void> => {
  await api.patch(`/bookings/${id}/cancel`);
};

// Payments
export const createPaymentIntent = async (data: CreatePaymentIntentRequest) => {
  const response = await api.post('/payments/create-payment-intent', data);
  return response.data.data;
};

export default api;
