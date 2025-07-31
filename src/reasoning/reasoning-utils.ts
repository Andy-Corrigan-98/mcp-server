/**
 * Validate a number parameter for reasoning operations
 */
export function validateNumber(value: number, min: number): number {
  if (typeof value !== 'number' || value < min || !Number.isInteger(value)) {
    throw new Error(`Invalid number: must be integer >= ${min}`);
  }
  return value;
}








