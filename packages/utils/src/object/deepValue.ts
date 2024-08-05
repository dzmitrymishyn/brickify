import assert from 'assert';

export const deepValue = (value: unknown, path: string[]) => {
  let current = value;

  for (const slot of path) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    if (Array.isArray(current)) {
      current = current[Number(slot)];
    } else {
      current = (current as Record<string, unknown>)[slot];
    }
  }

  assert(!Array.isArray(current), 'Path should point to a brick');

  return current || null;
};
