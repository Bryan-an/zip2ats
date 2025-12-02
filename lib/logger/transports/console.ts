/**
 * Console Transport
 * Outputs structured JSON logs to console
 * Compatible with Edge Runtime
 */

import type { LogEntry, LogTransport } from "../types";
import type { LogLevel } from "../constants";
import { LOG_LEVELS } from "../constants";

/**
 * Console transport options
 */
export interface ConsoleTransportOptions {
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Pretty print JSON (default: false in production, true in development) */
  prettyPrint?: boolean;
}

/**
 * Console transport - outputs logs as JSON to console
 */
export class ConsoleTransport implements LogTransport {
  readonly name = "console";
  readonly minLevel?: LogLevel;
  private readonly prettyPrint: boolean;

  constructor(options: ConsoleTransportOptions = {}) {
    this.minLevel = options.minLevel;

    this.prettyPrint =
      options.prettyPrint ?? process.env.NODE_ENV !== "production";
  }

  /**
   * Format and output log entry to console
   */
  log(entry: LogEntry): void {
    const output = this.prettyPrint
      ? JSON.stringify(entry, null, 2)
      : JSON.stringify(entry);

    switch (entry.level) {
      case LOG_LEVELS.DEBUG:
        console.debug(output);
        break;
      case LOG_LEVELS.INFO:
        console.info(output);
        break;
      case LOG_LEVELS.WARN:
        console.warn(output);
        break;
      case LOG_LEVELS.ERROR:
        console.error(output);
        break;
    }
  }
}
