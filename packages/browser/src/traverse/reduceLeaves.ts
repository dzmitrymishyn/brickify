import { getFirstDeepLeaf } from './getFirstDeepLeaf';
import { getLastDeepLeaf } from './getLastDeepLeaf';
import { getNextPossibleSibling } from './getNextPossibleSibling';
import { getPreviousPossibleSibling } from './getPreviousPossibleSibling';

export const reduceLeaves = <T>(
  acc: T,
  from: Node,
  to: Node,
  fn: (acc: T, node: Node) => T,
): T => {
  const range = new Range();

  range.setStart(from, 0);
  range.setEnd(getLastDeepLeaf(getPreviousPossibleSibling(to))!, 0);

  let currentAcc = acc;
  let current: Node | null = getFirstDeepLeaf(from);

  while (current && range.intersectsNode(current)) {
    current = getFirstDeepLeaf(current)!;

    currentAcc = fn(currentAcc, current);

    current = getNextPossibleSibling(current);
  }

  return currentAcc;
};
