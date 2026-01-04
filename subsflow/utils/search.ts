
export function getTrigrams(str: string): Set<string> {
  const normalized = str.toLowerCase().replace(/\s+/g, '');
  const trigrams = new Set<string>();
  if (normalized.length < 3) {
    trigrams.add(normalized);
    return trigrams;
  }
  for (let i = 0; i < normalized.length - 2; i++) {
    trigrams.add(normalized.substring(i, i + 3));
  }
  return trigrams;
}

export function trigramSimilarity(query: string, target: string): number {
  if (!query) return 1;
  const queryTrigrams = getTrigrams(query);
  const targetTrigrams = getTrigrams(target);
  
  let intersection = 0;
  queryTrigrams.forEach(t => {
    if (targetTrigrams.has(t)) intersection++;
  });
  
  return intersection / Math.max(queryTrigrams.size, 1);
}
