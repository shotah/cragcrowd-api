// Global test setup
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB for testing
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.DB_NAME = 'test';
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Stop in-memory MongoDB
  if (mongod) {
    await mongod.stop();
  }
});

// Suppress console logs during tests unless needed
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};