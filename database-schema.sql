-- Ski Instructor Booking System Database Schema
-- PostgreSQL Schema

-- Create database
-- CREATE DATABASE ski_instructor_booking;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'instructor', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructors table (extends users)
CREATE TABLE instructors (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[] NOT NULL, -- Array of specialties
    certifications TEXT[],
    experience INTEGER NOT NULL CHECK (experience >= 0),
    hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate > 0),
    languages TEXT[] NOT NULL,
    profile_image VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    preferred_locations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table (extends users)
CREATE TABLE clients (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    skill_level VARCHAR(20) NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    preferred_language VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability table
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(20) CHECK (recurring_pattern IN ('weekly', 'monthly', 'custom')),
    recurring_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instructor_id, date)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    lesson_type VARCHAR(20) NOT NULL CHECK (lesson_type IN ('private', 'group', 'family', 'corporate')),
    skill_level VARCHAR(20) NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0), -- minutes
    location VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled_by_client', 'cancelled_by_instructor', 'no_show')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    commission_amount DECIMAL(10,2) NOT NULL CHECK (commission_amount >= 0),
    special_requests TEXT,
    equipment_needed BOOLEAN DEFAULT false,
    group_size INTEGER DEFAULT 1 CHECK (group_size >= 1),
    client_notes TEXT,
    instructor_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id) -- One review per booking
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')),
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    processed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table (for JWT refresh tokens)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id),
    INDEX(expires_at)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_instructors_rating ON instructors(rating);
CREATE INDEX idx_instructors_hourly_rate ON instructors(hourly_rate);
CREATE INDEX idx_instructors_specialties ON instructors USING GIN(specialties);
CREATE INDEX idx_instructors_languages ON instructors USING GIN(languages);
CREATE INDEX idx_availability_instructor_date ON availability(instructor_id, date);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_instructor_id ON bookings(instructor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_reviews_instructor_id ON reviews(instructor_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON instructors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update instructor rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_instructor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE instructors 
    SET rating = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM reviews 
        WHERE instructor_id = NEW.instructor_id
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE instructor_id = NEW.instructor_id
    )
    WHERE id = NEW.instructor_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update instructor rating
CREATE TRIGGER update_instructor_rating_trigger 
    AFTER INSERT OR UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_instructor_rating();

-- Sample data for development
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john.doe@example.com', '$2b$12$hash1', 'John', 'Doe', '+1234567890', 'instructor'),
('550e8400-e29b-41d4-a716-446655440001', 'jane.smith@example.com', '$2b$12$hash2', 'Jane', 'Smith', '+1234567891', 'instructor'),
('550e8400-e29b-41d4-a716-446655440002', 'client@example.com', '$2b$12$hash3', 'Test', 'Client', '+1234567892', 'client');

INSERT INTO instructors (id, bio, specialties, certifications, experience, hourly_rate, languages, rating, review_count, preferred_locations) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Professional ski instructor with 10 years of experience', ARRAY['alpine_skiing', 'freestyle'], ARRAY['CSIA Level 3', 'First Aid Certified'], 10, 75.00, ARRAY['English', 'French'], 4.8, 127, ARRAY['Whistler', 'Banff']),
('550e8400-e29b-41d4-a716-446655440001', 'Snowboard specialist focusing on beginners and freestyle', ARRAY['snowboarding', 'freestyle'], ARRAY['CASI Level 2', 'Avalanche Safety Level 1'], 7, 65.00, ARRAY['English', 'German'], 4.9, 89, ARRAY['Whistler', 'Sun Peaks']);

INSERT INTO clients (id, skill_level, preferred_language, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'intermediate', 'English', 'Emergency Contact', '+1234567899', 'Spouse');