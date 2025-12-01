/**
 * Shared types for the XML parser module
 */

import type { SRIAmbiente } from "@/constants/sri-codes";

/**
 * Authorization info from SRI response envelope
 */
export interface AutorizacionInfo {
  numeroAutorizacion: string;
  fechaAutorizacion: string;
  ambiente: SRIAmbiente;
}
