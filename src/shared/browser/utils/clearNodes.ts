import { isElement } from './element';
import { isText } from './text';

export const clearNodes = (root: DocumentFragment | Node, selector: string, clearRoot = false) => {
  const ancestors: ChildNode[] = [];
  let current: ChildNode | null = root.firstChild;

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

    if (current.hasChildNodes()) {
      ancestors.push(current);
      current = current.firstChild;
    } else {
      current = current.nextSibling;
    }
  }

  if (clearRoot && isElement(root) && root.matches(selector)) {
    root.replaceWith(...Array.from(root.childNodes));
  }

  return root;
};
