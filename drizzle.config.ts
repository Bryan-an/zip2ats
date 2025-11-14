import { defineConfig } from "drizzle-kit";

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
    // For local development
    // wranglerConfigPath: './wrangler.toml',
    // dbName: 'zip2ats-db',

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
