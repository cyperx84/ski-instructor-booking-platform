# 📊 Instructor Dashboard Guide

Complete guide for instructors to manage their bookings and track earnings.

## 🎯 Overview

The instructor dashboard provides a comprehensive management interface for instructors to:
- View all bookings (upcoming and past)
- Track earnings and statistics
- Manage lesson status
- Analyze performance metrics

## 🚀 Getting Started

### Accessing the Dashboard

1. **Register as an Instructor**
   - Go to `/register`
   - Select "Teach as an instructor" role
   - Complete registration

2. **Login**
   - Navigate to `/login`
   - Use your instructor credentials
   - You'll see a "Dashboard" link in the navigation

3. **Access Dashboard**
   - Click "Dashboard" in the top navigation
   - Or navigate directly to `/dashboard`

## 📈 Dashboard Features

### Main Dashboard (`/dashboard`)

#### Key Statistics Cards
- **Total Bookings** - All-time booking count with upcoming count
- **Completed Lessons** - Number of finished lessons
- **Total Earnings** - Your payout after 15% platform fee
- **Average Rating** - Your instructor rating with total lessons

#### Monthly Earnings Chart
- Shows last 12 months of earnings
- Displays both gross revenue and your payout (85%)
- Includes booking count per month

#### Bookings Management
- **Toggle Views:**
  - **Upcoming** - Future bookings that need attention
  - **Past** - Historical bookings and completed lessons

- **Booking Information:**
  - Client name, email, and phone
  - Date, time, and duration
  - Activity and skill level
  - Special requests from client
  - Booking status (pending, confirmed, completed, cancelled)
  - Your earnings (85% of total price)

- **Actions:**
  - **Mark Complete** - Available for confirmed bookings
  - Automatically increments your lesson count
  - Updates earnings totals

### Detailed Earnings (`/dashboard/earnings`)

#### Summary Statistics
- **Total Payout** - Your 85% share of all completed lessons
- **Gross Revenue** - Full booking amounts
- **Platform Fees** - 15% commission breakdown
- **Completed Lessons** - Total count

#### Earnings History Table
Detailed breakdown showing:
- Date and client name
- Lesson duration
- Gross booking amount
- Platform fee (15%)
- Your payout (85%)
- Payment status

#### Tax & Payout Information
- Payout schedule: 2-3 business days
- 1099 form provided annually
- Fee structure explanation

## 💰 Earnings Breakdown

### How Earnings Work

```
Example Booking: $100 (2-hour lesson at $50/hour)

Client Pays:     $100.00
Platform Fee:    $15.00 (15%)
Your Payout:     $85.00 (85%)
```

### Payment Timeline
1. Client books and pays
2. You complete the lesson
3. Mark booking as "complete"
4. Funds transferred in 2-3 business days

## 🎓 Best Practices

### Managing Bookings

**For Upcoming Bookings:**
- Review client details and special requests
- Check skill level to prepare appropriate lesson
- Note client contact information
- Confirm timing and meeting location

**After Completing Lessons:**
- Mark booking as complete promptly
- This triggers payment processing
- Updates your statistics
- Builds your review history

### Maximizing Earnings

1. **Keep Availability Updated**
   - Add availability slots regularly
   - Remove slots you can't honor
   - Plan ahead for peak seasons

2. **Maintain High Ratings**
   - Provide excellent instruction
   - Be punctual and professional
   - Communicate clearly with clients

3. **Set Competitive Rates**
   - Research other instructors
   - Consider your experience level
   - Adjust seasonally if needed

## 🔧 Technical Details

### API Endpoints Used

```
GET  /api/instructor/dashboard           # Main dashboard data
GET  /api/instructor/bookings            # Filtered bookings
GET  /api/instructor/earnings            # Earnings breakdown
PATCH /api/instructor/bookings/:id/complete  # Mark complete
```

### Data Refresh

- Dashboard data loads on page visit
- Statistics update when bookings change
- Manual refresh available via browser

### Security

- Instructor role required
- JWT authentication enforced
- Can only view own bookings
- Can only modify own bookings

## 📱 Mobile Access

The dashboard is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

All features available across devices.

## 🐛 Troubleshooting

**Can't access dashboard?**
- Ensure you're logged in
- Verify you registered as an instructor
- Check browser console for errors

**Bookings not showing?**
- Refresh the page
- Check filter (upcoming vs past)
- Verify bookings exist in system

**Earnings don't match?**
- Remember: you receive 85% payout
- Platform takes 15% fee
- Only completed lessons count

**Can't mark booking complete?**
- Booking must be "confirmed" status
- You must be the assigned instructor
- Check if already completed

## 🎯 Quick Reference

### Keyboard Shortcuts
- None currently (future feature)

### Status Colors
- 🟡 **Pending** - Yellow (awaiting payment)
- 🔵 **Confirmed** - Blue (paid, upcoming)
- 🟢 **Completed** - Green (finished)
- 🔴 **Cancelled** - Red (cancelled by either party)

### Next Steps

1. Complete your instructor profile
2. Add availability slots
3. Wait for bookings
4. Mark lessons complete
5. Track your earnings
6. Build your reputation!

---

**Need Help?** Contact support or check the main README.md for more information.
