# 🏂 Snowboard Instructor Booking MVP

A **simple, working MVP** for booking snowboard and ski instructors. Built with modern technologies and real Stripe payment integration.

## 🎯 What This Is

This is a **simplified, production-ready** platform for connecting snowboard/ski instructors with clients. Unlike the complex reference repo, this MVP focuses on:

- ✅ **Core functionality only** - no unnecessary features
- ✅ **Easy to understand** - clean, straightforward code
- ✅ **Actually works** - full booking flow from search to payment
- ✅ **Real payments** - integrated with Stripe
- ✅ **Modern stack** - TypeScript, Next.js 15, PostgreSQL

## 🚀 Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (5 core tables)
- JWT authentication
- Stripe payment integration
- bcrypt password hashing

**Frontend:**
- Next.js 15 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Stripe Elements for payments
- Axios for API calls

## 📦 Project Structure

```
snowboard-booking-mvp/
├── backend/              # Express API
│   ├── src/
│   │   ├── config/       # Database, Stripe config
│   │   ├── models/       # Data models
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, error handling
│   │   └── index.ts      # Main server file
│   └── package.json
├── frontend/             # Next.js app
│   ├── app/              # App router pages
│   ├── components/       # UI components
│   ├── lib/              # API client, utilities
│   └── package.json
├── database/
│   ├── migrations/       # SQL migrations
│   └── seeds/            # Sample data
├── shared/
│   └── types.ts          # Shared TypeScript types
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 14+ installed and running
- **Stripe account** (free test mode)

### 1. Clone and Install

```bash
cd /home/user/snowboard-booking-mvp
npm install
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE snowboard_booking;

# Exit
\q

# Run migrations
psql -U postgres -d snowboard_booking -f database/migrations/001_create_tables.sql
```

### 3. Environment Variables

**Backend (.env in root):**

```bash
cp .env.example .env
# Edit .env with your values
```

**Frontend (.env.local in frontend/):**

```bash
cd frontend
cp .env.local.example .env.local
# Add your Stripe publishable key
```

### 4. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **test** API keys:
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`
3. Add them to your `.env` files

### 5. Start Development Servers

```bash
# From root directory - starts both backend and frontend
npm run dev
```

Or start individually:

```bash
# Backend (runs on http://localhost:3001)
cd backend
npm install
npm run dev

# Frontend (runs on http://localhost:3000)
cd frontend
npm install
npm run dev
```

### 6. Create Test Data

You'll need to register users and create instructor profiles manually through the UI, or run the seed script:

```bash
# TODO: Add seed script
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/instructor/complete-profile` - Complete instructor profile

### Instructors
- `GET /api/instructors/search` - Search instructors
- `GET /api/instructors/:id` - Get instructor details
- `GET /api/instructors/:id/availability` - Get available time slots
- `POST /api/instructors/:id/availability` - Create availability (instructor only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/user/my-bookings` - Get user's bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/booking/:bookingId` - Get payment details

## 💳 Payment Flow

1. Client searches for instructors
2. Client selects instructor and available time slot
3. Client creates booking
4. System creates Stripe Payment Intent
5. Client enters payment details (Stripe Elements)
6. Stripe processes payment
7. Webhook confirms payment
8. Booking status updated to "confirmed"

**Platform takes 15% fee, instructor gets 85%**

## 🔐 User Roles

- **Client**: Can search and book instructors
- **Instructor**: Can create availability, receive bookings
- **Admin**: (Basic - can be expanded)

## 🎨 Key Features

### For Clients
- ✅ Search instructors by activity, rate, rating
- ✅ View instructor profiles and certifications
- ✅ Select skill level and add special requests
- ✅ Book available time slots
- ✅ Secure payment with Stripe
- ✅ View booking history

### For Instructors
- ✅ Create instructor profile
- ✅ Set hourly rate and specialties
- ✅ Add certifications
- ✅ Create availability slots
- ✅ Receive bookings
- ✅ Automatic payouts (85% of booking price)

## 🧪 Testing

### Test Credit Cards (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

Use any future expiry date and any CVC.

## 📱 Pages

- `/` - Homepage with features
- `/instructors` - Search instructors
- `/instructors/[id]` - Instructor profile & booking
- `/bookings/[id]` - Payment page
- `/login` - User login
- `/register` - User registration

## 🔧 Database Schema

### Core Tables (5 Total)

1. **users** - All users (clients, instructors, admins)
2. **instructors** - Instructor profiles and details
3. **availability_slots** - Instructor availability
4. **bookings** - Lesson bookings
5. **payments** - Payment transactions

## 🚀 Deployment

### Backend

1. Set up PostgreSQL database
2. Run migrations
3. Set environment variables
4. Deploy to your platform (Heroku, Railway, etc.)

### Frontend

1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or your platform
3. Set `NEXT_PUBLIC_API_URL` to your backend URL

## 📝 Environment Variables Reference

**Backend:**
- `DB_*` - PostgreSQL connection
- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `PORT` - Server port (default 3001)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🐛 Troubleshooting

**Database connection fails:**
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Ensure database exists

**Stripe payments fail:**
- Using test keys? (start with `sk_test_` and `pk_test_`)
- Correct publishable key in frontend?
- Test cards from above working?

**CORS errors:**
- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend URL matches

## 📈 Next Steps / Future Enhancements

This is a **working MVP**. Consider adding:

- [ ] Instructor dashboard with earnings
- [ ] Review/rating system
- [ ] Email notifications
- [ ] Calendar sync (Google Calendar)
- [ ] Mobile app (React Native)
- [ ] Advanced search filters
- [ ] Multi-day booking packages
- [ ] Weather integration

## 🤝 Contributing

This is a simple MVP. Feel free to fork and enhance!

## 📄 License

MIT License - use however you want!

---

**Built with ❤️ as a simplified alternative to complex booking systems**

*Focus on what matters: A working product that actually books lessons and processes payments.*
