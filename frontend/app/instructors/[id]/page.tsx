'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInstructor, getInstructorAvailability, createBooking } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  InstructorWithUser,
  AvailabilitySlot,
  Activity,
  SkillLevel,
} from '../../../../shared/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function InstructorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instructorId = params.id as string;

  const [instructor, setInstructor] = useState<InstructorWithUser | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    activity: 'snowboarding' as Activity,
    skillLevel: 'intermediate' as SkillLevel,
    specialRequests: '',
  });

  useEffect(() => {
    loadInstructor();
    loadAvailability();
  }, [instructorId]);

  const loadInstructor = async () => {
    try {
      const data = await getInstructor(instructorId);
      setInstructor(data);
    } catch (error) {
      console.error('Failed to load instructor:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const data = await getInstructorAvailability(instructorId);
      setAvailability(data);
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const booking = await createBooking({
        instructorId,
        availabilitySlotId: selectedSlot,
        ...bookingData,
      });

      router.push(`/bookings/${booking.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create booking');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!instructor) {
    return <div className="text-center py-12">Instructor not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Instructor Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            {instructor.user.firstName} {instructor.user.lastName}
            {instructor.isVerified && <span className="text-blue-500 ml-2">✓ Verified</span>}
          </CardTitle>
          <CardDescription>
            {instructor.yearsExperience} years experience • {instructor.specialties.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{instructor.bio}</p>
            </div>
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(instructor.hourlyRate)}
              </div>
              <div className="text-sm text-muted-foreground">per hour</div>
              <div className="mt-4">
                <div className="text-xl font-semibold">⭐ {instructor.rating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">
                  {instructor.totalLessons} lessons taught
                </div>
              </div>
            </div>
          </div>

          {instructor.certifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {instructor.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Book a Lesson</CardTitle>
          <CardDescription>Select your preferences and available time slot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity">Activity</Label>
              <select
                id="activity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bookingData.activity}
                onChange={(e) =>
                  setBookingData({ ...bookingData, activity: e.target.value as Activity })
                }
              >
                <option value="snowboarding">Snowboarding</option>
                <option value="skiing">Skiing</option>
              </select>
            </div>

            <div>
              <Label htmlFor="skillLevel">Skill Level</Label>
              <select
                id="skillLevel"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bookingData.skillLevel}
                onChange={(e) =>
                  setBookingData({ ...bookingData, skillLevel: e.target.value as SkillLevel })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <textarea
              id="specialRequests"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Any specific goals or requirements..."
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
            />
          </div>

          <div>
            <Label>Select Available Time Slot</Label>
            {availability.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No available slots at the moment. Please check back later.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                {availability.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 text-left border rounded-md transition-colors ${
                      selectedSlot === slot.id
                        ? 'border-primary bg-primary/10'
                        : 'border-input hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-medium">{formatDateTime(slot.startTime)}</div>
                    <div className="text-xs text-muted-foreground">
                      to {new Date(slot.endTime).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleBooking} size="lg" className="w-full" disabled={!selectedSlot}>
            Continue to Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
