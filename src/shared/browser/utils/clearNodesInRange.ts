import { isElement } from './element';
import { isText } from './text';
import { closestUntilChildOfParent } from '../traverse';

export const clearNodesInRange = (range: Range, selector: string) => {
  const ancestors: Node[] = [];
  let current: Node | null = closestUntilChildOfParent(
    range.startContainer,
    range.commonAncestorContainer,
  );
  const end: Node | null = closestUntilChildOfParent(
    range.endContainer,
    range.commonAncestorContainer,
  );

  while (current || ancestors.length) {
    if (!current) {
      current = ancestors.pop()?.nextSibling || null;
      // eslint-disable-next-line no-continue
      continue;
    }

    if (isText(current)) {
      current = current.nextSibling;
      // eslint-disable-next-line no-continue
      continue;
    }

    if (isElement(current) && current.matches(selector)) {
      const temp = current.firstChild;
      current.replaceWith(...Array.from(current.childNodes));
      current = temp;
      // eslint-disable-next-line no-continue
      continue;
    }

    ancestors.push(current);
    current = current.firstChild;
  }
};
