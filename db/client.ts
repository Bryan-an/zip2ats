import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

/**
 * Creates a Drizzle database client for Cloudflare D1
 * @param d1 - D1Database instance from Cloudflare Workers environment
 * @returns Drizzle database client with schema
 */
export function createDbClient(d1: D1Database) {
  return drizzle(d1, { schema });
}

/**
 * Type of the database client
 */
export type DbClient = ReturnType<typeof createDbClient>;

/**
 * Example usage in Cloudflare Workers or Next.js API routes:
 *
 * @example
 * // In a Cloudflare Worker
 * export interface Env {
 *   DB: D1Database;
 * }
 *
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     const db = createDbClient(env.DB);
 *     const allUsers = await db.select().from(schema.users);
 *     return Response.json(allUsers);
 *   }
 * };
 *
 * @example
 * // In a Next.js route handler running on Cloudflare (OpenNext)
 * // (the exact context helper depends on your adapter/runtime setup)
 *
 * export async function GET() {
 *   const { env } = getAdapterRequestContext();
 *   const db = createDbClient(env.DB);
 *   const allUsers = await db.select().from(schema.users);
 *   return Response.json(allUsers);
 * }
 */
