-- Sample data for testing the snowboard booking MVP
-- Run this after running the migrations

-- Insert sample users
-- Password for all users is: 'password123' (hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, role, phone_number) VALUES
  ('john.client@example.com', '$2b$10$rJ8qYf8dV3mKZGzQqY4Ld.Y5xHLh5qE8F8O8pQ4O8F8pQ4O8F8pQ4', 'John', 'Doe', 'client', '555-0101'),
  ('sarah.instructor@example.com', '$2b$10$rJ8qYf8dV3mKZGzQqY4Ld.Y5xHLh5qE8F8O8pQ4O8F8pQ4O8F8pQ4', 'Sarah', 'Johnson', 'instructor', '555-0102'),
  ('mike.instructor@example.com', '$2b$10$rJ8qYf8dV3mKZGzQqY4Ld.Y5xHLh5qE8F8O8pQ4O8F8pQ4O8F8pQ4', 'Mike', 'Thompson', 'instructor', '555-0103'),
  ('emma.instructor@example.com', '$2b$10$rJ8qYf8dV3mKZGzQqY4Ld.Y5xHLh5qE8F8O8pQ4O8F8pQ4O8F8pQ4', 'Emma', 'Wilson', 'instructor', '555-0104');

-- Get user IDs for instructors
DO $$
DECLARE
  sarah_user_id UUID;
  mike_user_id UUID;
  emma_user_id UUID;
  sarah_instructor_id UUID;
  mike_instructor_id UUID;
  emma_instructor_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah.instructor@example.com';
  SELECT id INTO mike_user_id FROM users WHERE email = 'mike.instructor@example.com';
  SELECT id INTO emma_user_id FROM users WHERE email = 'emma.instructor@example.com';

  -- Insert instructor profiles
  INSERT INTO instructors (user_id, bio, specialties, hourly_rate, years_experience, certifications, rating, total_lessons, is_verified)
  VALUES
    (
      sarah_user_id,
      'Professional snowboard instructor with 8 years of experience. Specialized in teaching beginners and intermediate riders. AASI Level 2 certified.',
      ARRAY['snowboarding']::varchar[],
      75.00,
      8,
      ARRAY['AASI Level 2', 'First Aid Certified', 'Avalanche Safety Level 1']::text[],
      4.8,
      156,
      true
    ),
    (
      mike_user_id,
      'Expert ski instructor focusing on advanced techniques and off-piste skiing. 12 years on the mountains teaching all levels.',
      ARRAY['skiing']::varchar[],
      95.00,
      12,
      ARRAY['PSIA Level 3', 'Backcountry Skiing Certified', 'Children Teaching Specialist']::text[],
      4.9,
      203,
      true
    ),
    (
      emma_user_id,
      'Versatile instructor teaching both skiing and snowboarding. Great with kids and families. Patient and encouraging teaching style.',
      ARRAY['snowboarding', 'skiing']::varchar[],
      65.00,
      5,
      ARRAY['AASI Level 1', 'PSIA Level 2', 'Kids Specialist']::text[],
      4.7,
      89,
      true
    )
  RETURNING id INTO sarah_instructor_id;

  -- Get instructor IDs
  SELECT id INTO sarah_instructor_id FROM instructors WHERE user_id = sarah_user_id;
  SELECT id INTO mike_instructor_id FROM instructors WHERE user_id = mike_user_id;
  SELECT id INTO emma_instructor_id FROM instructors WHERE user_id = emma_user_id;

  -- Insert availability slots for next 7 days
  -- Sarah's availability
  INSERT INTO availability_slots (instructor_id, start_time, end_time, is_booked)
  SELECT
    sarah_instructor_id,
    (CURRENT_DATE + INTERVAL '1 day' * day + INTERVAL '1 hour' * hour),
    (CURRENT_DATE + INTERVAL '1 day' * day + INTERVAL '1 hour' * (hour + 2)),
    false
  FROM generate_series(1, 7) AS day
  CROSS JOIN generate_series(9, 15, 2) AS hour;

  -- Mike's availability
  INSERT INTO availability_slots (instructor_id, start_time, end_time, is_booked)
  SELECT
    mike_instructor_id,
    (CURRENT_DATE + INTERVAL '1 day' * day + INTERVAL '1 hour' * hour),
    (CURRENT_DATE + INTERVAL '1 day' * day + INTERVAL '1 hour' * (hour + 2)),
    false
  FROM generate_series(1, 7) AS day
  CROSS JOIN generate_series(10, 16, 2) AS hour;

  -- Emma's availability
  INSERT INTO availability_slots (instructor_id, start_time, end_time, is_booked)
  SELECT
    emma_instructor_id,
    (CURRENT_DATE + INTERVAL '1 day' * day + INTERVAL '1 hour' * hour),
    (CURRENT_DATE + INTERVAL '1 day' * day + INTERVAL '1 hour' * (hour + 2)),
    false
  FROM generate_series(1, 7) AS day
  CROSS JOIN generate_series(8, 14, 2) AS hour;

END $$;

-- Verify data
SELECT 'Users created:' AS info, COUNT(*) AS count FROM users;
SELECT 'Instructors created:' AS info, COUNT(*) AS count FROM instructors;
SELECT 'Availability slots created:' AS info, COUNT(*) AS count FROM availability_slots;

COMMENT ON TABLE users IS 'Sample users created. Password for all users is: password123';
