/**
 * Health check endpoint
 * Used for monitoring and load balancer health checks
 */

import express from 'express';
import mongoose from 'mongoose';
import { successResponse } from '../utils/responseHandler.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        readyState: dbState,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      environment: process.env.NODE_ENV || 'development',
    };

    // If database is not connected, return unhealthy status
    if (dbState !== 1) {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        ...health,
      });
    }

    return successResponse(res, 200, health, 'Service is healthy');
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: error.message,
    });
  }
});

export default router;
