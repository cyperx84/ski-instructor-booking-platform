'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInstructorDashboard, getInstructorBookings, markBookingComplete } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { BookingStatus } from '../../../shared/types';

interface DashboardData {
  instructor: any;
  stats: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalEarnings: number;
    instructorPayout: number;
    averageRating: number;
  };
  monthlyEarnings: Array<{
    month: Date;
    bookingCount: number;
    revenue: number;
    payout: number;
  }>;
}

interface BookingWithClient {
  id: string;
  startTime: Date;
  endTime: Date;
  activity: string;
  skillLevel: string;
  status: BookingStatus;
  durationHours: number;
  totalPrice: number;
  specialRequests?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [bookings, setBookings] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    // Check if user is logged in and is an instructor
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'instructor') {
      alert('Access denied. Instructor account required.');
      router.push('/');
      return;
    }

    loadDashboard();
    loadBookings('upcoming');
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getInstructorDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (timeframe: 'upcoming' | 'past') => {
    try {
      const data = await getInstructorBookings({ timeframe });
      setBookings(data);
      setActiveTab(timeframe);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    if (!confirm('Mark this booking as complete?')) return;

    try {
      await markBookingComplete(bookingId);
      alert('Booking marked as complete!');
      loadDashboard();
      loadBookings(activeTab);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete booking');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (!dashboard) {
    return <div className="text-center py-12">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {dashboard.instructor.user?.firstName || 'Instructor'}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{dashboard.stats.totalBookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {dashboard.stats.upcomingBookings} upcoming
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Lessons</CardDescription>
            <CardTitle className="text-3xl">{dashboard.stats.completedBookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Earnings</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(dashboard.stats.instructorPayout)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(dashboard.stats.totalEarnings)} gross (85% payout)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="text-3xl">
              ⭐ {dashboard.stats.averageRating.toFixed(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {dashboard.instructor.totalLessons} total lessons
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Earnings Chart */}
      {dashboard.monthlyEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings (Last 12 Months)</CardTitle>
            <CardDescription>Your earnings breakdown by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.monthlyEarnings.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {new Date(month.month).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {month.bookingCount} booking{month.bookingCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {formatCurrency(month.payout)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(month.revenue)} gross
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Bookings</CardTitle>
              <CardDescription>View and manage your lesson bookings</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'upcoming' ? 'default' : 'outline'}
                onClick={() => loadBookings('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={activeTab === 'past' ? 'default' : 'outline'}
                onClick={() => loadBookings('past')}
              >
                Past
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {activeTab} bookings found
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {booking.client.firstName} {booking.client.lastName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Date & Time</div>
                          <div className="font-medium">{formatDateTime(booking.startTime)}</div>
                          <div className="text-xs text-muted-foreground">
                            {booking.durationHours} hour{booking.durationHours > 1 ? 's' : ''}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Activity & Level</div>
                          <div className="font-medium capitalize">
                            {booking.activity} - {booking.skillLevel}
                          </div>
                        </div>

                        <div>
                          <div className="text-muted-foreground">Contact</div>
                          <div className="font-medium">{booking.client.email}</div>
                          {booking.client.phoneNumber && (
                            <div className="text-xs">{booking.client.phoneNumber}</div>
                          )}
                        </div>

                        <div>
                          <div className="text-muted-foreground">Earnings</div>
                          <div className="font-medium text-primary">
                            {formatCurrency(booking.totalPrice * 0.85)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({formatCurrency(booking.totalPrice)} total)
                          </div>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm text-muted-foreground mb-1">
                            Special Requests
                          </div>
                          <div className="text-sm">{booking.specialRequests}</div>
                        </div>
                      )}
                    </div>

                    {booking.status === BookingStatus.CONFIRMED && (
                      <Button
                        onClick={() => handleCompleteBooking(booking.id)}
                        className="ml-4"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
