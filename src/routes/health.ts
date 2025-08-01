import { Router } from 'express';
import { getDatabase } from '../database/connection';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  try {
    // Check database connection
    const db = getDatabase();
    await db.admin().ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});