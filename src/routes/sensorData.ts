import { Router } from 'express';
import { z } from 'zod';
import { getDatabase } from '../database/connection';
import { logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation';

export const sensorDataRouter = Router();

// Validation schema for sensor data
const sensorDataSchema = z.object({
  wall_id: z.string().min(1),
  device_count: z.number().int().min(0),
  timestamp: z.number().int().positive(),
  gateway_id: z.string().optional(),
  rssi: z.number().optional(),
  snr: z.number().optional(),
  received_at: z.number().int().positive().optional()
});

const querySensorDataSchema = z.object({
  wall_id: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(1000)).optional()
});

// POST /api/sensor-data - Receive data from gateway
sensorDataRouter.post('/', validateRequest(sensorDataSchema), async (req, res) => {
  try {
    const sensorData = req.body;
    const db = getDatabase();
    
    // Add server timestamp
    const dataWithServerTime = {
      ...sensorData,
      server_timestamp: new Date(),
      created_at: new Date()
    };
    
    // Insert into database
    const result = await db.collection('sensor_readings').insertOne(dataWithServerTime);
    
    logger.info('Sensor data received', {
      wall_id: sensorData.wall_id,
      device_count: sensorData.device_count,
      insertedId: result.insertedId
    });
    
    res.status(201).json({
      success: true,
      id: result.insertedId,
      message: 'Sensor data received successfully'
    });
  } catch (error) {
    logger.error('Error saving sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save sensor data'
    });
  }
});

// GET /api/sensor-data - Query sensor data
sensorDataRouter.get('/', validateRequest(querySensorDataSchema, 'query'), async (req, res) => {
  try {
    const { wall_id, start_time, end_time, limit = 100 } = req.query as any;
    const db = getDatabase();
    
    // Build query
    const query: any = {};
    
    if (wall_id) {
      query.wall_id = wall_id;
    }
    
    if (start_time || end_time) {
      query.server_timestamp = {};
      if (start_time) {
        query.server_timestamp.$gte = new Date(start_time);
      }
      if (end_time) {
        query.server_timestamp.$lte = new Date(end_time);
      }
    }
    
    // Execute query
    const data = await db.collection('sensor_readings')
      .find(query)
      .sort({ server_timestamp: -1 })
      .limit(limit)
      .toArray();
    
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    logger.error('Error querying sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to query sensor data'
    });
  }
});

// GET /api/sensor-data/walls - Get list of walls with recent data
sensorDataRouter.get('/walls', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get unique wall IDs with their latest data
    const walls = await db.collection('sensor_readings').aggregate([
      {
        $group: {
          _id: '$wall_id',
          latest_reading: { $max: '$server_timestamp' },
          device_count: { $last: '$device_count' }
        }
      },
      {
        $project: {
          wall_id: '$_id',
          latest_reading: 1,
          device_count: 1,
          _id: 0
        }
      },
      {
        $sort: { latest_reading: -1 }
      }
    ]).toArray();
    
    res.json({
      success: true,
      count: walls.length,
      walls
    });
  } catch (error) {
    logger.error('Error getting walls data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get walls data'
    });
  }
});