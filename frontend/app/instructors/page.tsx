'use client';

import { useState, useEffect } from 'react';
import { searchInstructors } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { InstructorWithUser, Activity } from '../../../shared/types';
import { formatCurrency } from '@/lib/utils';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    activity: '' as Activity | '',
    minRate: '',
    maxRate: '',
  });

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const data = await searchInstructors({
        activity: filters.activity || undefined,
        minRate: filters.minRate ? parseFloat(filters.minRate) : undefined,
        maxRate: filters.maxRate ? parseFloat(filters.maxRate) : undefined,
      });
      setInstructors(data);
    } catch (error) {
      console.error('Failed to load instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadInstructors();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Find Your Perfect Instructor</h1>
        <p className="text-muted-foreground">
          Browse our selection of certified snowboard and ski instructors
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="activity">Activity</Label>
              <select
                id="activity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.activity}
                onChange={(e) => setFilters({ ...filters, activity: e.target.value as Activity })}
              >
                <option value="">All</option>
                <option value="snowboarding">Snowboarding</option>
                <option value="skiing">Skiing</option>
              </select>
            </div>
            <div>
              <Label htmlFor="minRate">Min Rate</Label>
              <Input
                id="minRate"
                type="number"
                placeholder="$50"
                value={filters.minRate}
                onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maxRate">Max Rate</Label>
              <Input
                id="maxRate"
                type="number"
                placeholder="$200"
                value={filters.maxRate}
                onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">Loading instructors...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>
                  {instructor.user.firstName} {instructor.user.lastName}
                </CardTitle>
                <CardDescription>
                  {instructor.yearsExperience} years experience • {instructor.specialties.join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{instructor.bio}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(instructor.hourlyRate)}
                    </div>
                    <div className="text-xs text-muted-foreground">per hour</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ⭐ {instructor.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {instructor.totalLessons} lessons
                    </div>
                  </div>
                </div>
                <Link href={`/instructors/${instructor.id}`}>
                  <Button className="w-full">View Profile & Book</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && instructors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No instructors found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
