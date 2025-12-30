import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load production env vars explicitly for Drizzle tooling.
loadEnv({ path: ".env.production", override: true });

export default defineConfig({
  // Schema location
  schema: "./db/schema.ts",

  // Output directory for migrations
  out: "./db/migrations",

  // Database driver
  dialect: "sqlite",

  // Driver-specific configuration
  driver: "d1-http",

  // Cloudflare D1 configuration
  dbCredentials: {
    // For remote (requires Cloudflare account ID and D1 API token)
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },

  // Print SQL statements
  verbose: true,

  // Strict mode
  strict: true,
});
