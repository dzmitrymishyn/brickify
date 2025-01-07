import { getFirstDeepLeaf } from './getFirstDeepLeaf';
import { getNextPossibleSibling } from './getNextPossibleSibling';

export const findLeaf = (
  container: Node,
  fn: (node: Node) => boolean,
): Node | null => {
  const range = new Range();

  range.setStart(container, 0);
  range.setEndAfter(container);

  let current: Node | null = container;

  while (current && range.intersectsNode(current)) {
    current = getFirstDeepLeaf(current)!;

    while (current.childNodes.length) {
      current = current.childNodes[0];
    }

    if (fn(current)) {
      return current;
    }

    current = getNextPossibleSibling(current);
  }

  return null;
};
