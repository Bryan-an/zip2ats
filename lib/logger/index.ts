/**
 * Logger singleton instance
 * Edge Runtime compatible logging system
 *
 * @example
 * ```typescript
 * import { logger } from "@/lib/logger";
 *
 * // Basic usage
 * logger.info("User created", { userId: "123" });
 * logger.error("Upload failed", error, { filename: "doc.zip" });
 *
 * // With context (child logger)
 * const reqLogger = logger.withContext({ requestId: "abc-123" });
 * reqLogger.info("Processing request"); // includes requestId
 * ```
 */

import { Logger } from "./logger";
import { ConsoleTransport } from "./transports/console";

/**
 * Default logger instance with console transport
 */
export const logger = new Logger();
logger.addTransport(new ConsoleTransport());
