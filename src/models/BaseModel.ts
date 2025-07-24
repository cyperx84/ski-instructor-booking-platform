import { Pool, PoolClient } from 'pg';
import pool from '@/config/database';
import logger from '@/utils/logger';

export abstract class BaseModel {
  protected pool: Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.pool = pool;
    this.tableName = tableName;
  }

  /**
   * Execute a query with parameters
   */
  protected async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      logger.debug('Executing query', { text, params });
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      logger.error('Database query error', { error, text, params });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  protected async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error', { error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<any | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all records with optional conditions
   */
  async findAll(conditions?: Record<string, any>, limit?: number, offset?: number): Promise<any[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    let paramCount = 0;

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = $${++paramCount}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    if (limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${++paramCount}`;
      params.push(offset);
    }

    const result = await this.query(query, params);
    return result.rows;
  }

  /**
   * Create a new record
   */
  async create(data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: Record<string, any>): Promise<any | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    if (keys.length === 0) {
      throw new Error('No data provided for update');
    }

    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const result = await this.query(query, [...values, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Count records with optional conditions
   */
  async count(conditions?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];
    let paramCount = 0;

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = $${++paramCount}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    const result = await this.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Check if record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.query(
      `SELECT 1 FROM ${this.tableName} WHERE id = $1 LIMIT 1`,
      [id]
    );
    return result.rows.length > 0;
  }
}