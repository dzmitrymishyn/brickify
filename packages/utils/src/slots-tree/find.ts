import { type Node } from './node';
import assert from 'assert';

export const find = (node: Node, path: string[]) => {
  let current: Node | Node[] = node;

  for (const slot of path) {
    if (!current) {
      return null;
    }

    if (Array.isArray(current)) {
      current = current[Number(slot)];
    } else {
      current = current.slots[slot];
    }
  }

  assert(!Array.isArray(current), 'Path should point to a brick');

  return current || null;
};
