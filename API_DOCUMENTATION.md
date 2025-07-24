# Ski Instructor Booking API Documentation

## Overview
This is the backend API for the ski/snowboard instructor booking system. It provides endpoints for user management, instructor profiles, booking management, and availability scheduling.

## Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://your-domain.com/api/v1`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": string (only on errors),
  "meta": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Endpoints

### Authentication (`/auth`)

#### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "client|instructor|admin"
  }
  ```
- **Response:** User object with tokens

#### Login
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with tokens

#### Get Profile
- **GET** `/auth/profile`
- **Auth:** Required
- **Response:** Current user's profile

#### Update Profile
- **PUT** `/auth/profile`
- **Auth:** Required
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
  ```

#### Change Password
- **PUT** `/auth/change-password`
- **Auth:** Required
- **Body:**
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```

### Instructors (`/instructors`)

#### Get All Instructors
- **GET** `/instructors`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sortBy`: Sort field (default: 'rating')
  - `sortOrder`: 'asc' or 'desc' (default: 'desc')
  - `specialty`: Filter by specialty
  - `location`: Filter by location
  - `priceMin`: Minimum hourly rate
  - `priceMax`: Maximum hourly rate
  - `rating`: Minimum rating
  - `language`: Filter by language

#### Get Instructor by ID
- **GET** `/instructors/:id`
- **Response:** Instructor profile

#### Create Instructor Profile
- **POST** `/instructors/profile`
- **Auth:** Required (instructor role)
- **Body:**
  ```json
  {
    "bio": "Professional ski instructor...",
    "specialties": ["alpine_skiing", "freestyle"],
    "certifications": ["CSIA Level 3"],
    "experience": 10,
    "hourlyRate": 75,
    "languages": ["English", "French"],
    "isAvailable": true,
    "preferredLocations": ["Whistler", "Banff"]
  }
  ```

#### Update Instructor Profile
- **PUT** `/instructors/:id`
- **Auth:** Required (own profile or admin)
- **Body:** Same as create profile

#### Toggle Availability
- **PATCH** `/instructors/:id/availability`
- **Auth:** Required (own profile or admin)
- **Response:** Updated instructor profile

### Bookings (`/bookings`)

#### Create Booking
- **POST** `/bookings`
- **Auth:** Required (client role)
- **Body:**
  ```json
  {
    "instructorId": "instructor-uuid",
    "lessonType": "private|group|family|corporate",
    "skillLevel": "beginner|intermediate|advanced|expert",
    "startTime": "2024-01-15T10:00:00Z",
    "duration": 120,
    "location": "Whistler Village",
    "specialRequests": "Focus on parallel turns",
    "equipmentNeeded": true,
    "groupSize": 1,
    "clientNotes": "First time skiing"
  }
  ```

#### Get Bookings
- **GET** `/bookings`
- **Auth:** Required
- **Query Parameters:**
  - `page`: Page number
  - `limit`: Items per page
  - `status`: Filter by status
  - `dateFrom`: Start date filter
  - `dateTo`: End date filter

#### Get Booking by ID
- **GET** `/bookings/:id`
- **Auth:** Required (own booking or admin)

#### Update Booking
- **PUT** `/bookings/:id`
- **Auth:** Required (own booking or admin)
- **Body:** Same fields as create booking

#### Cancel Booking
- **PATCH** `/bookings/:id/cancel`
- **Auth:** Required (own booking or admin)
- **Body:**
  ```json
  {
    "reason": "Cancellation reason"
  }
  ```

#### Confirm Booking
- **PATCH** `/bookings/:id/confirm`
- **Auth:** Required (instructor or admin)

#### Complete Booking
- **PATCH** `/bookings/:id/complete`
- **Auth:** Required (instructor or admin)
- **Body:**
  ```json
  {
    "instructorNotes": "Lesson went well..."
  }
  ```

### Availability (`/availability`)

#### Get Instructor Availability
- **GET** `/availability/instructor/:instructorId`
- **Query Parameters:**
  - `dateFrom`: Start date
  - `dateTo`: End date

#### Get Available Time Slots
- **GET** `/availability/instructor/:instructorId/slots/:date`
- **Query Parameters:**
  - `duration`: Lesson duration in minutes (default: 60)

#### Create Availability
- **POST** `/availability`
- **Auth:** Required (instructor role)
- **Body:**
  ```json
  {
    "date": "2024-01-15",
    "startTime": "09:00",
    "endTime": "17:00",
    "isAvailable": true,
    "isRecurring": false,
    "recurringPattern": "weekly|monthly|custom",
    "recurringEndDate": "2024-02-15"
  }
  ```

#### Get My Availability
- **GET** `/availability/my`
- **Auth:** Required (instructor role)

#### Update Availability
- **PUT** `/availability/:id`
- **Auth:** Required (own availability or admin)

#### Delete Availability
- **DELETE** `/availability/:id`
- **Auth:** Required (own availability or admin)

#### Bulk Create Availability
- **POST** `/availability/bulk`
- **Auth:** Required (instructor role)
- **Body:**
  ```json
  {
    "availabilityList": [
      {
        "date": "2024-01-15",
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  }
  ```

### Health Check (`/health`)

#### Basic Health Check
- **GET** `/health`
- **Response:** Basic service status

#### Detailed Health Check
- **GET** `/health/detailed`
- **Response:** Detailed system status including database, memory, CPU

#### Readiness Check
- **GET** `/health/ready`
- **Response:** Service readiness status

#### Liveness Check
- **GET** `/health/live`
- **Response:** Service liveness status

## Error Codes

- **400**: Bad Request - Invalid request data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **422**: Unprocessable Entity - Validation error
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error
- **503**: Service Unavailable - Service temporarily unavailable

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 5 minutes per IP

## Data Types

### User Roles
- `client`: Regular users who book lessons
- `instructor`: Ski/snowboard instructors
- `admin`: System administrators

### Skill Levels
- `beginner`: First-time or very new skiers/snowboarders
- `intermediate`: Can ski/snowboard basic slopes comfortably
- `advanced`: Can handle most slopes and conditions
- `expert`: Highly skilled, can handle all conditions

### Booking Status
- `pending`: Waiting for instructor confirmation
- `confirmed`: Confirmed by instructor
- `in_progress`: Lesson is currently happening
- `completed`: Lesson finished successfully
- `cancelled_by_client`: Cancelled by the client
- `cancelled_by_instructor`: Cancelled by the instructor
- `no_show`: Client didn't show up

### Lesson Types
- `private`: One-on-one instruction
- `group`: Group lessons (2-10 people)
- `family`: Family lessons
- `corporate`: Corporate/team events

### Ski Specialties
- `alpine_skiing`: Traditional downhill skiing
- `snowboarding`: Snowboarding instruction
- `freestyle`: Freestyle skiing/snowboarding
- `racing`: Racing techniques
- `backcountry`: Off-piste skiing
- `cross_country`: Cross-country skiing
- `telemark`: Telemark skiing
- `adaptive`: Adaptive skiing for disabilities