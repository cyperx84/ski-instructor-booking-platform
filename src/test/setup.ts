import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Mock logger to avoid console output during tests
jest.mock('@/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock database connection
jest.mock('@/config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
  testConnection: jest.fn().mockResolvedValue(true),
  initDatabase: jest.fn().mockResolvedValue(undefined),
}));

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.BCRYPT_SALT_ROUNDS = '10';
  
  // Initialize any global test dependencies
});

afterAll(async () => {
  // Clean up any global test resources
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
});