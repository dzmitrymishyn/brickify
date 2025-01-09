import { getFirstDeepLeaf } from './getFirstDeepLeaf';
import { getNextPossibleSibling } from './getNextPossibleSibling';

export const findLeaf = (
  startNode: Node,
  fn: (node: Node) => boolean | 'break',
): Node | null => {
  let current: Node | null = startNode;

  while (current) {
    current = getFirstDeepLeaf(current)!;

    const result = fn(current);

    if (result === 'break') {
      return null;
    }

    if (result) {
      return current;
    }

    current = getNextPossibleSibling(current);
  }

  return null;
};
