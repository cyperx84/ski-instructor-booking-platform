'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getBooking, createPaymentIntent } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingWithDetails } from '../../../../shared/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings/${bookingId}/success`,
      },
    });

    if (error) {
      setMessage(error.message || 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="text-destructive text-sm">{message}</div>}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
      </Button>
    </form>
  );
}

export default function BookingPaymentPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingAndPayment();
  }, [bookingId]);

  const loadBookingAndPayment = async () => {
    try {
      const bookingData = await getBooking(bookingId);
      setBooking(bookingData);

      // Create payment intent
      const paymentData = await createPaymentIntent({ bookingId });
      setClientSecret(paymentData.clientSecret);
    } catch (error) {
      console.error('Failed to load booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!booking) {
    return <div className="text-center py-12">Booking not found</div>;
  }

  const options = {
    clientSecret,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Complete Your Booking</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Instructor</div>
              <div className="font-semibold">
                {booking.instructor.user.firstName} {booking.instructor.user.lastName}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Activity</div>
              <div className="font-semibold capitalize">{booking.activity}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Skill Level</div>
              <div className="font-semibold capitalize">{booking.skillLevel}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="font-semibold">{formatDateTime(booking.startTime)}</div>
              <div className="text-sm">
                Duration: {booking.durationHours} hour{booking.durationHours > 1 ? 's' : ''}
              </div>
            </div>

            {booking.specialRequests && (
              <div>
                <div className="text-sm text-muted-foreground">Special Requests</div>
                <div className="text-sm">{booking.specialRequests}</div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(booking.totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter your payment information securely</CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret && (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm bookingId={bookingId} amount={booking.totalPrice} />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
