# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 1. Prerequisites Check

```bash
# Check Node.js (should be 18+)
node --version

# Check PostgreSQL (should be 14+)
psql --version

# Check npm (should be 9+)
npm --version
```

## 2. Database Setup (2 minutes)

```bash
# Create database
createdb snowboard_booking

# Run migrations
psql -d snowboard_booking -f database/migrations/001_create_tables.sql

# Add sample data (3 instructors with availability)
psql -d snowboard_booking -f database/seeds/001_sample_data.sql
```

## 3. Backend Setup (1 minute)

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your Stripe secret key (get from https://dashboard.stripe.com/test/apikeys)
# At minimum, set:
# - STRIPE_SECRET_KEY=sk_test_your_key_here

# Install and run
cd backend
npm install
npm run dev
```

Backend should now be running on http://localhost:3001

## 4. Frontend Setup (1 minute)

```bash
# In a new terminal
cd frontend

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local and add your Stripe publishable key
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Install and run
npm install
npm run dev
```

Frontend should now be running on http://localhost:3000

## 5. Test It Out!

1. **Go to** http://localhost:3000
2. **Register** a new account (click "Sign Up")
3. **Browse** instructors at http://localhost:3000/instructors
4. **Book** a lesson with one of the sample instructors
5. **Pay** with test card: `4242 4242 4242 4242`

## Test Users

Sample data includes these accounts (password: `password123`):

- **Client**: john.client@example.com
- **Instructor**: sarah.instructor@example.com (Snowboarding)
- **Instructor**: mike.instructor@example.com (Skiing)
- **Instructor**: emma.instructor@example.com (Both)

## Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/register
2. Skip through setup (you can use test mode right away)
3. Go to **Developers** → **API Keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)
6. Add them to `.env` (backend) and `.env.local` (frontend)

## Troubleshooting

**Database error?**
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

**Port already in use?**
```bash
# Backend (3001) or Frontend (3000) port busy?
# Change PORT in .env (backend) or run: PORT=3002 npm run dev
```

**Stripe error?**
- Make sure you're using TEST keys (they start with `sk_test_` and `pk_test_`)
- Keys must be from the same Stripe account

---

That's it! You should now have a fully functional booking platform 🎉
