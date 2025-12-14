/**
 * Utility functions for ZIP compression/decompression using fflate
 * Provides promisified wrappers for fflate's callback-based API
 */

import { zip, unzip, type AsyncZippable, type Unzipped } from "fflate";

/**
 * Promisified wrapper for fflate's zip function
 * Compresses multiple files into a single ZIP archive
 *
 * @param files - Record of filename to file content (as Uint8Array)
 * @returns Promise resolving to compressed ZIP file as Uint8Array
 *
 * @example
 * ```typescript
 * const files = {
 *   'file1.txt': new TextEncoder().encode('Hello'),
 *   'file2.txt': new TextEncoder().encode('World')
 * };
 * const zipped = await zipAsync(files);
 * ```
 */
export function zipAsync(files: AsyncZippable): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    zip(files, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Promisified wrapper for fflate's unzip function
 * Extracts all files from a ZIP archive
 *
 * @param data - ZIP file content as Uint8Array
 * @returns Promise resolving to record of filename to file content
 *
 * @example
 * ```typescript
 * const zipData = new Uint8Array([...]); // ZIP file bytes
 * const files = await unzipAsync(zipData);
 * // files = { 'file1.txt': Uint8Array, 'file2.txt': Uint8Array }
 * ```
 */
export function unzipAsync(data: Uint8Array): Promise<Unzipped> {
  return new Promise((resolve, reject) => {
    unzip(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
