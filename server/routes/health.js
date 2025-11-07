/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       example: 2024-01-01T00:00:00.000Z
 *                     uptime:
 *                       type: number
 *                       example: 3600
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         readyState:
 *                           type: number
 *                           example: 1
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                           example: 100
 *                         total:
 *                           type: number
 *                           example: 500
 *                     environment:
 *                       type: string
 *                       example: development
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
