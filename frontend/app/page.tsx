'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-5xl font-bold mb-4">Learn to Ride with the Best</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Book professional snowboard and ski instructors for unforgettable mountain experiences
        </p>
        <Link href="/instructors">
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Find Your Instructor
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose SnowPro?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Verified Instructors</CardTitle>
              <CardDescription>
                All instructors are certified and experienced professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Every instructor on our platform has verified certifications and years of teaching
                experience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Easy Booking</CardTitle>
              <CardDescription>Book lessons in just a few clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simple, secure booking process with instant confirmation and flexible scheduling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>Safe and encrypted transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Industry-standard payment processing powered by Stripe for your peace of mind.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Hit the Slopes?</h2>
        <p className="text-lg mb-6 text-muted-foreground">
          Join thousands of riders who've improved their skills with SnowPro
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/instructors">
            <Button size="lg" variant="outline">
              Browse Instructors
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
