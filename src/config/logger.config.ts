/**
 * @file Logger
 * @author kolynzb
 */

import winston, { transports, LoggerOptions, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

let level = 'info';

if (process.env.NODE_ENV === 'production') level = 'warn';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const options: LoggerOptions = {
  silent: false,
  level: level,
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true }),
      ),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    new transports.File({
      filename: 'logs/combined.log',
    }),
    new DailyRotateFile({
      dirname: 'logs',
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      level,
    }),
  ],
};

const log: Logger = winston.createLogger(options);
export default log;
