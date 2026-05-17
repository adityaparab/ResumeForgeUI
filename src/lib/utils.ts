/**
 * Converts a string to spinal-case (kebab-case).
 * e.g. "John Doe" → "john-doe", "Senior Engineer (2024)" → "senior-engineer-2024"
 */
export function toSpinalCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // replace special chars with space
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
}
