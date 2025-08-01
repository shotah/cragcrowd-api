import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

export function validateRequest(schema: z.ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      (req as any)[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error:', {
          target,
          errors: error.errors,
          data: req[target]
        });
        
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        });
      } else {
        logger.error('Unexpected validation error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  };
}