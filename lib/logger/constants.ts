/**
 * Logger constants
 */

/**
 * Log severity levels
 */
export const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
} as const;

/**
 * Log level type derived from LOG_LEVELS
 */
export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

/**
 * Numeric values for log level filtering
 */
export const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  [LOG_LEVELS.DEBUG]: 0,
  [LOG_LEVELS.INFO]: 1,
  [LOG_LEVELS.WARN]: 2,
  [LOG_LEVELS.ERROR]: 3,
};
