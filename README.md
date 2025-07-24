# Ski Instructor Booking Backend API

A robust, scalable backend API for the ski/snowboard instructor booking system built with Node.js, Express, and TypeScript.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👨‍🏫 **Instructor Management** - Complete instructor profile management
- 📅 **Booking System** - Full booking lifecycle management
- ⏰ **Availability Management** - Flexible instructor availability scheduling
- 🛡️ **Security** - Rate limiting, input validation, and security headers
- 📊 **Health Monitoring** - Comprehensive health check endpoints
- 🗄️ **Database Ready** - PostgreSQL connection setup
- 🧪 **Testing** - Jest testing framework with supertest
- 📝 **Logging** - Winston logging with different levels
- 🔧 **TypeScript** - Full TypeScript support with strict configuration

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 13.0 or higher (for production)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### Instructors
- `GET /api/v1/instructors` - Get all instructors (with filtering)
- `GET /api/v1/instructors/:id` - Get instructor by ID
- `POST /api/v1/instructors/profile` - Create instructor profile
- `PUT /api/v1/instructors/:id` - Update instructor profile
- `PATCH /api/v1/instructors/:id/availability` - Toggle availability
- `GET /api/v1/instructors/:id/stats` - Get instructor statistics

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get bookings (filtered by user)
- `GET /api/v1/bookings/:id` - Get booking by ID
- `PUT /api/v1/bookings/:id` - Update booking
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking
- `PATCH /api/v1/bookings/:id/confirm` - Confirm booking
- `PATCH /api/v1/bookings/:id/complete` - Complete booking

### Availability
- `GET /api/v1/availability/instructor/:id` - Get instructor availability
- `GET /api/v1/availability/instructor/:id/slots/:date` - Get available time slots
- `POST /api/v1/availability` - Create availability
- `GET /api/v1/availability/my` - Get my availability
- `PUT /api/v1/availability/:id` - Update availability
- `DELETE /api/v1/availability/:id` - Delete availability
- `POST /api/v1/availability/bulk` - Bulk create availability

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

## Architecture

### Project Structure
```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── models/          # Data models (when using database)
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── test/            # Test setup and utilities
```

### Key Components

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Client, Instructor, Admin)
   - Token refresh mechanism

2. **Security**
   - Rate limiting (general + auth endpoints)
   - Input validation with Joi
   - Security headers with Helmet
   - Request sanitization
   - CORS configuration

3. **Error Handling**
   - Global error handler
   - Custom error classes
   - Structured error responses
   - Comprehensive logging

4. **Data Validation**
   - Joi schema validation
   - Request/response validation middleware
   - Type-safe data handling

## Environment Variables

Key environment variables (see `.env.example` for full list):

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ski_instructor_booking
DB_USER=postgres
DB_PASSWORD=password
```

## Database Setup

This API is configured to work with PostgreSQL. The database connection setup is in `src/config/database.ts`.

To set up the database:

1. Install PostgreSQL
2. Create a database named `ski_instructor_booking`
3. Update the database connection settings in `.env`
4. Run database migrations (when implemented)

## Testing

The project uses Jest for testing with supertest for HTTP testing.

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Logging

The API uses Winston for logging with different levels:
- `error`: Error messages
- `warn`: Warning messages
- `info`: Informational messages
- `debug`: Debug messages

In production, logs are written to files in the `logs/` directory.

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 5 minutes per IP

## Security Features

- JWT token authentication
- Rate limiting
- Input validation and sanitization
- Security headers (Helmet)
- CORS configuration
- Request size limiting
- SQL injection prevention
- XSS protection

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Support
A Dockerfile can be added for containerized deployment.

### Environment Setup
Ensure all production environment variables are set, especially:
- `JWT_SECRET` (use a strong, random secret)
- Database connection settings
- CORS origins for your frontend

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Run linting and type checking

## License

MIT License

## Technical Decisions

### Why Express?
- Mature and well-supported framework
- Large ecosystem of middleware
- Excellent TypeScript support
- Great for RESTful APIs

### Why TypeScript?
- Type safety and better developer experience
- Better IDE support and refactoring
- Compile-time error catching
- Self-documenting code

### Why JWT?
- Stateless authentication
- Scalable across multiple servers
- Works well with mobile apps
- Industry standard

### Why PostgreSQL?
- ACID compliance
- Excellent performance
- Rich feature set
- Great for relational data

### Why Joi for Validation?
- Comprehensive validation library
- Good TypeScript support
- Flexible and powerful
- Great error messages

This backend provides a solid foundation for the ski instructor booking system with security, scalability, and maintainability in mind.