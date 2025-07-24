import { Router, Request, Response } from 'express';
import { testConnection } from '@/config/database';
import { ApiResponse } from '@/types';
import config from '@/config';
import logger from '@/utils/logger';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Service is healthy',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      version: '1.0.0',
    },
  };

  res.json(response);
});

// Detailed health check with dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  const checks = {
    database: false,
    memory: false,
    cpu: false,
  };

  // Database check
  try {
    checks.database = await testConnection();
  } catch (error) {
    logger.error('Database health check failed', error);
    checks.database = false;
  }

  // Memory check
  const memoryUsage = process.memoryUsage();
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  checks.memory = memoryUsagePercent < 90; // Consider unhealthy if over 90%

  // CPU check (simplified - in production, you might want to use a proper CPU monitoring library)
  const cpuUsage = process.cpuUsage();
  checks.cpu = true; // Basic check - process is running

  const isHealthy = Object.values(checks).every(check => check === true);

  const response: ApiResponse = {
    success: isHealthy,
    message: isHealthy ? 'All systems operational' : 'Some systems are experiencing issues',
    data: {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      version: '1.0.0',
      checks,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          usagePercent: Math.round(memoryUsagePercent),
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
      },
    },
  };

  res.status(isHealthy ? 200 : 503).json(response);
});

// Readiness check (for Kubernetes/Docker)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const isDatabaseReady = await testConnection();
    
    if (!isDatabaseReady) {
      return res.status(503).json({
        success: false,
        message: 'Service not ready - database connection failed',
        data: {
          status: 'not_ready',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Service is ready',
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      success: false,
      message: 'Service not ready',
      data: {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Liveness check (for Kubernetes/Docker)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service is alive',
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;