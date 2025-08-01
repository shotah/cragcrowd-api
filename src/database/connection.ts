import { MongoClient, Db } from 'mongodb';
import { logger } from '../utils/logger';

let db: Db;
let client: MongoClient;

export async function connectDatabase(): Promise<void> {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const databaseName = process.env.DB_NAME || 'cragcrowd';
    
    client = new MongoClient(connectionString);
    await client.connect();
    
    db = client.db(databaseName);
    
    logger.info(`Connected to MongoDB database: ${databaseName}`);
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    logger.info('Database connection closed');
  }
}