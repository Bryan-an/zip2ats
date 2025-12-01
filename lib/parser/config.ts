import { ValidationError, XMLParser, XMLValidator } from "fast-xml-parser";

/**
 * Configuration for fast-xml-parser optimized for SRI XML documents
 */
export const parserOptions = {
  // Preserve attributes with @_ prefix (e.g., @_id, @_version)
  ignoreAttributes: false,
  attributeNamePrefix: "@_",

  // Handle CDATA sections (SRI wraps comprobante in CDATA)
  cdataPropName: "__cdata",

  // Keep numbers as strings to preserve precision (monetary values)
  parseTagValue: false,
  parseAttributeValue: false,

  // Trim whitespace from text content
  trimValues: true,

  // Process tag names (keep original case)
  transformTagName: undefined,

  // Handle comments (ignore them)
  commentPropName: false,

  // Allow boolean attributes
  allowBooleanAttributes: true,

  // Remove namespace prefixes if present
  removeNSPrefix: true,
} as const;

/**
 * Pre-configured XML parser instance for SRI documents
 */
export function createSRIParser(): XMLParser {
  return new XMLParser(parserOptions);
}

/**
 * Validate XML syntax
 * @returns true if valid, ValidationError if invalid
 */
export function validateXMLSyntax(xml: string): true | ValidationError {
  return XMLValidator.validate(xml, {
    allowBooleanAttributes: true,
  });
}

export { XMLParser, XMLValidator };
