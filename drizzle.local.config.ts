import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local development env vars explicitly for Drizzle tooling.
loadEnv({ path: ".env.local", override: true });

const localDbPath = process.env.LOCAL_DB_PATH ?? "./db.sqlite";

export default defineConfig({
  // Schema location
  schema: "./db/schema.ts",

  // Output directory for migrations
  out: "./db/migrations",

  // Database driver
  dialect: "sqlite",

  // Cloudflare D1 configuration
  dbCredentials: {
    url: localDbPath,
  },

  // Print SQL statements
  verbose: true,

  // Strict mode
  strict: true,
});
