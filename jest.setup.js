// jest.setup.js
import '@testing-library/jest-dom';

// Mock environment variables
process.env.ADMIN_SECRET_TOKEN = 'test_admin_token';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';