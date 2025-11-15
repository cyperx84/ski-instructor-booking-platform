'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInstructorEarnings } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface EarningsData {
  earnings: Array<{
    bookingId: string;
    startTime: Date;
    durationHours: number;
    totalPrice: number;
    platformFee: number;
    instructorPayout: number;
    paymentStatus: string;
    clientName: string;
  }>;
  summary: {
    totalRevenue: number;
    totalPayout: number;
    totalFees: number;
    completedBookings: number;
  };
}

export default function EarningsPage() {
  const router = useRouter();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'instructor') {
      router.push('/');
      return;
    }

    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const data = await getInstructorEarnings();
      setEarningsData(data);
    } catch (error: any) {
      console.error('Failed to load earnings:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading earnings...</div>;
  }

  if (!earningsData) {
    return <div className="text-center py-12">Failed to load earnings</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Earnings</h1>
          <p className="text-muted-foreground">Detailed breakdown of your instructor earnings</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Payout</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {formatCurrency(earningsData.summary.totalPayout)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">85% of gross revenue</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gross Revenue</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(earningsData.summary.totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Total from {earningsData.summary.completedBookings} lessons
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Platform Fees</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(earningsData.summary.totalFees)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">15% commission</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Lessons</CardDescription>
            <CardTitle className="text-3xl">{earningsData.summary.completedBookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Detailed breakdown of each completed lesson</CardDescription>
        </CardHeader>
        <CardContent>
          {earningsData.earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No completed lessons yet. Start teaching to see your earnings here!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 pb-3 border-b font-semibold text-sm">
                <div className="col-span-2">Date & Client</div>
                <div>Duration</div>
                <div className="text-right">Gross</div>
                <div className="text-right">Fee (15%)</div>
                <div className="text-right">Your Payout</div>
              </div>

              {/* Table Rows */}
              {earningsData.earnings.map((earning) => (
                <div
                  key={earning.bookingId}
                  className="grid grid-cols-6 gap-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-2">
                    <div className="font-medium">{earning.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(earning.startTime)}
                    </div>
                  </div>
                  <div className="text-sm">
                    {earning.durationHours} hour{earning.durationHours > 1 ? 's' : ''}
                  </div>
                  <div className="text-right font-medium">
                    {formatCurrency(earning.totalPrice)}
                  </div>
                  <div className="text-right text-muted-foreground">
                    {formatCurrency(earning.platformFee)}
                  </div>
                  <div className="text-right font-semibold text-primary">
                    {formatCurrency(earning.instructorPayout)}
                  </div>
                </div>
              ))}

              {/* Total Row */}
              <div className="grid grid-cols-6 gap-4 pt-4 border-t-2 font-bold">
                <div className="col-span-3">Total</div>
                <div className="text-right">{formatCurrency(earningsData.summary.totalRevenue)}</div>
                <div className="text-right">{formatCurrency(earningsData.summary.totalFees)}</div>
                <div className="text-right text-primary">
                  {formatCurrency(earningsData.summary.totalPayout)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 About Your Earnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Platform Fee:</strong> SnowPro takes a 15% commission on each booking to cover
            payment processing, platform maintenance, and customer support.
          </p>
          <p>
            <strong>Payout Schedule:</strong> Earnings from completed lessons are automatically
            processed and transferred to your account within 2-3 business days.
          </p>
          <p>
            <strong>Tax Information:</strong> You'll receive a 1099 form at the end of the year for
            tax purposes. Keep track of your earnings for your records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
