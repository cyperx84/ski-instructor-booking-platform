import logger from '@/utils/logger';

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Log service operations
   */
  protected log(level: 'info' | 'error' | 'warn' | 'debug', message: string, meta?: any): void {
    logger[level](`[${this.serviceName}] ${message}`, meta);
  }

  /**
   * Handle service errors consistently
   */
  protected handleError(error: any, operation: string): never {
    this.log('error', `Error in ${operation}`, {
      error: error.message,
      stack: error.stack,
      operation
    });
    
    // Re-throw with service context
    throw new Error(`${this.serviceName} - ${operation}: ${error.message}`);
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Sanitize data by removing undefined values
   */
  protected sanitizeData(data: any): any {
    const sanitized: any = {};
    
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        sanitized[key] = data[key];
      }
    });
    
    return sanitized;
  }

  /**
   * Create pagination info
   */
  protected createPaginationInfo(
    total: number,
    limit: number,
    offset: number
  ): {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    
    return {
      total,
      limit,
      offset,
      totalPages,
      currentPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }
}