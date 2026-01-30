import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // 确保日志目录存在
    const logDir = path.join(process.cwd(), 'logs');
    
    // 配置 winston
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level.toUpperCase()}: ${message}`;
        })
      ),
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} ${level.toUpperCase()}: ${message}`;
            })
          )
        }),
        // 文件输出（按日期分割）
        new winston.transports.File({
          filename: path.join(logDir, 'application-%DATE%.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          tailable: true,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} ${level.toUpperCase()}: ${message}`;
            })
          )
        }),
        // 错误日志文件
        new winston.transports.File({
          filename: path.join(logDir, 'error-%DATE%.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          tailable: true,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} ${level.toUpperCase()}: ${message}`;
            })
          )
        }),
        // 额外的按小时命名的日志文件（包含所有日志）
        new DailyRotateFile({
          filename: path.join(logDir, '%DATE%-combined.log'),
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info', // 记录所有级别的日志
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.printf(({ timestamp, level, message }) => {
              return `${timestamp} ${level.toUpperCase()}: ${message}`;
            })
          )
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'exceptions-%DATE%.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          tailable: true
        })
      ]
    });
  }

  log(message: any, context?: string): void {
    this.logger.info(typeof message === 'object' ? JSON.stringify(message) : message, { context });
  }

  error(message: any, stack?: string, context?: string): void {
    this.logger.error(typeof message === 'object' ? JSON.stringify(message) : message, { stack, context });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(typeof message === 'object' ? JSON.stringify(message) : message, { context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(typeof message === 'object' ? JSON.stringify(message) : message, { context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(typeof message === 'object' ? JSON.stringify(message) : message, { context });
  }
}
