/**
 * Logger types and interfaces
 * Edge Runtime compatible logging system
 */

import type { LogLevel } from "./constants";

/**
 * Serialized error information
 */
export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log severity level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Contextual information (request ID, user ID, etc.) */
  context?: Record<string, unknown>;
  /** Error details if logging an error */
  error?: SerializedError;
  /** Additional metadata */
  meta?: Record<string, unknown>;
}

/**
 * Transport interface - implement this to create custom log destinations
 */
export interface LogTransport {
  /** Transport identifier */
  readonly name: string;
  /** Minimum log level to process */
  minLevel?: LogLevel;
  /** Process a log entry */
  log(entry: LogEntry): void | Promise<void>;
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /** Minimum log level (default: "info" in production, "debug" in development) */
  minLevel?: LogLevel;
  /** Initial transports */
  transports?: LogTransport[];
  /** Default context added to all logs */
  defaultContext?: Record<string, unknown>;
}

/**
 * Logger interface
 */
export interface ILogger {
  /** Log debug message */
  debug(message: string, meta?: Record<string, unknown>): void;
  /** Log info message */
  info(message: string, meta?: Record<string, unknown>): void;
  /** Log warning message */
  warn(message: string, meta?: Record<string, unknown>): void;
  /** Log error message */
  error(
    message: string,
    error?: Error | unknown,
    meta?: Record<string, unknown>
  ): void;
  /** Create child logger with additional context */
  withContext(context: Record<string, unknown>): ILogger;
  /** Add a transport */
  addTransport(transport: LogTransport): void;
}
