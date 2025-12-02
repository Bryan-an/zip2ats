/**
 * Logger class
 * Edge Runtime compatible logging with multiple transports
 */

import type {
  ILogger,
  LogEntry,
  LoggerOptions,
  LogTransport,
  SerializedError,
} from "./types";
import type { LogLevel } from "./constants";
import { LOG_LEVELS, LOG_LEVEL_VALUES } from "./constants";

/**
 * Serialize an error object for logging
 */
function serializeError(error: Error | unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

/**
 * Logger implementation
 */
export class Logger implements ILogger {
  private transports: LogTransport[] = [];
  private minLevel: LogLevel;
  private context: Record<string, unknown>;

  constructor(options: LoggerOptions = {}) {
    this.minLevel =
      options.minLevel ??
      (process.env.NODE_ENV === "production"
        ? LOG_LEVELS.INFO
        : LOG_LEVELS.DEBUG);

    this.context = options.defaultContext ?? {};

    if (options.transports) {
      this.transports = [...options.transports];
    }
  }

  /**
   * Add a transport to the logger
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove a transport by name
   */
  removeTransport(name: string): void {
    this.transports = this.transports.filter((t) => t.name !== name);
  }

  /**
   * Create a child logger with additional context
   */
  withContext(context: Record<string, unknown>): ILogger {
    const child = new Logger({
      minLevel: this.minLevel,
      defaultContext: { ...this.context, ...context },
    });

    // Share transports with parent
    child.transports = this.transports;

    return child;
  }

  /**
   * Check if a log level should be processed
   */
  private shouldLog(level: LogLevel, transportMinLevel?: LogLevel): boolean {
    const loggerMin = LOG_LEVEL_VALUES[this.minLevel];
    const levelValue = LOG_LEVEL_VALUES[level];

    // Check logger minimum level
    if (levelValue < loggerMin) {
      return false;
    }

    // Check transport minimum level if specified
    if (transportMinLevel) {
      const transportMin = LOG_LEVEL_VALUES[transportMinLevel];

      if (levelValue < transportMin) {
        return false;
      }
    }

    return true;
  }

  /**
   * Dispatch log entry to all transports
   */
  private dispatch(
    level: LogLevel,
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>
  ): void {
    // Check if we should log at all
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Add context if present
    if (Object.keys(this.context).length > 0) {
      entry.context = this.context;
    }

    // Add error if present
    if (error !== undefined) {
      entry.error = serializeError(error);
    }

    // Add meta if present
    if (meta && Object.keys(meta).length > 0) {
      entry.meta = meta;
    }

    // Dispatch to all transports
    for (const transport of this.transports) {
      // Check transport-specific minimum level
      if (!this.shouldLog(level, transport.minLevel)) {
        continue;
      }

      try {
        const result = transport.log(entry);

        // Handle async transports without blocking
        if (result instanceof Promise) {
          result.catch((err) => {
            // Fallback to console if transport fails
            console.error(`Logger transport "${transport.name}" failed:`, err);
          });
        }
      } catch (err) {
        // Fallback to console if transport fails
        console.error(`Logger transport "${transport.name}" failed:`, err);
      }
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.dispatch(LOG_LEVELS.DEBUG, message, undefined, meta);
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.dispatch(LOG_LEVELS.INFO, message, undefined, meta);
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.dispatch(LOG_LEVELS.WARN, message, undefined, meta);
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>
  ): void {
    this.dispatch(LOG_LEVELS.ERROR, message, error, meta);
  }
}
