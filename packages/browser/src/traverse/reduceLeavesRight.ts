import { getLastDeepLeaf } from './getLastDeepLeaf';
import { getPreviousPossibleSibling } from './getPreviousPossibleSibling';

export const reduceLeavesRight = <T>(
  acc: T,
  start: Node | null,
  end: Node | null,
  fn: (acc: T, node: Node) => T,
): T => {
  if (!end || !start) {
    return acc;
  }

  const range = new Range();

  range.setStart(start, 0);
  range.setEnd(end, end.childNodes?.length ?? end.textContent?.length ?? 0);

  let currentAcc = acc;
  let current: Node | null = range.endContainer;

  while (current && range.intersectsNode(current)) {
    current = getLastDeepLeaf(current)!;

    currentAcc = fn(currentAcc, current);

    current = getPreviousPossibleSibling(current);
  }

  return currentAcc;
};
