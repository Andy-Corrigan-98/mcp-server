const MIN_DISTANCE = 0.1;

/**
 * Simple heuristic to estimate conceptual distance between two concepts
 * Returns a value between 0.1 and 1.0, where higher values indicate more distant concepts
 */
export function estimateConceptDistance(concept1: string, concept2: string): number {
  // Very basic heuristic - could be improved with actual semantic analysis
  const words1 = concept1.toLowerCase().split(/\s+/);
  const words2 = concept2.toLowerCase().split(/\s+/);

  // Check for word overlap
  const overlap = words1.filter(word => words2.includes(word)).length;
  const totalWords = Math.max(words1.length, words2.length);

  // Distance is inverse of overlap ratio
  return Math.max(MIN_DISTANCE, 1 - overlap / totalWords);
}
