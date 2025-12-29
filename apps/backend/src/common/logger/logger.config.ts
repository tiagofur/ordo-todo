import {
  utilities as nestWinstonUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = 'logs';

// Custom JSON formatter for structured logging
const jsonFormatter = winston.format.printf((info) => {
  const { timestamp, level, message, ...meta } = info;

  // Ensure all required fields are present
  const logEntry = {
    timestamp: timestamp || new Date().toISOString(),
    level: level || 'info',
    message: message || '',
    ...meta,
  };

  return JSON.stringify(logEntry);
});

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    // Console transport (pretty in dev, JSON in prod)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        jsonFormatter,
      ),
    }),
    // File transport for errors only (JSON structured)
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), jsonFormatter),
    }),
    // File transport for all logs (JSON structured)
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(winston.format.timestamp(), jsonFormatter),
    }),
  ],
};
