import { Pool, PoolConfig } from 'pg';
import config from './index';
import logger from '@/utils/logger';

const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: config.database.maxConnections,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
};

// Create database connection pool
export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle process termination
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database pool...');
  await pool.end();
  process.exit(0);
});

// Database connection test
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    logger.info('Database connection successful', {
      currentTime: result.rows[0].current_time,
      host: config.database.host,
      database: config.database.database,
    });
    
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
};

// Database initialization
export const initDatabase = async (): Promise<void> => {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed', error);
    throw error;
  }
};

export default pool;