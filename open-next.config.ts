import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * OpenNext (Cloudflare) configuration.
 *
 * We use the static-assets incremental cache to avoid introducing extra
 * infrastructure (R2/KV) for caching. If you need ISR/on-demand revalidation,
 * switch to KV or R2 incremental cache and add the corresponding bindings.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
