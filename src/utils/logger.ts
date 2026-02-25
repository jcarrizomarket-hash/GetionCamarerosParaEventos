import winston from 'winston';

// Determine the current environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Create a logger instance with structured logging
const logger = winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: isDevelopment
                ? winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
                : winston.format.json(),
        }),
        // You can add more transports such as file, HTTP, etc.
    ],
});

// Context-aware logging
const log = (message: string, context?: Record<string, any>): void => {
    logger.info({ message, context });
};

const error = (message: string, context?: Record<string, any>): void => {
    logger.error({ message, context });
};

const warn = (message: string, context?: Record<string, any>): void => {
    logger.warn({ message, context });
};

const debug = (message: string, context?: Record<string, any>): void => {
    logger.debug({ message, context });
};

export default {
    log,
    error,
    warn,
    debug,
};
