// Test setup configuration
export const setupTestEnvironment = () => {
    // Force in-memory repository for all e2e tests
    process.env.USE_FILE_STORAGE = 'false';
    process.env.USE_DATABASE = 'false';

    // Set test-specific JWT secret for consistent testing
    process.env.JWT_SECRET = 'test-secret-key-for-e2e-tests';
    process.env.JWT_EXPIRATION_TIME = '3600'; // 1 hour
};

export const cleanupTestEnvironment = () => {
    // Clean up environment variables
    delete process.env.USE_FILE_STORAGE;
    delete process.env.USE_DATABASE;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRATION_TIME;
};

// Mock user credentials for testing
export const TEST_USER = {
    username: 'testuser',
    password: 'password123'
}; 