export const levenshtein = (left: string, right: string) => {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }

  return matrix[left.length][right.length];
};

export const suggestId = (missingId: string, candidates: Iterable<string>) => {
  let best: { id: string; distance: number } | undefined;

  for (const id of candidates) {
    const distance = levenshtein(missingId, id);
    if (!best || distance < best.distance) {
      best = { id, distance };
    }
  }

  if (!best) return undefined;

  const threshold = Math.max(2, Math.floor(missingId.length / 3));
  return best.distance <= threshold ? best.id : undefined;
};
