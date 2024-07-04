import { isElement, isText } from '../utils';

export const clearNodes = (
  root: DocumentFragment | Node,
  selector: string,
  clearRoot = false,
) => {
  const ancestors: ChildNode[] = [];
  let current: ChildNode | null = root.firstChild;

  while (current || ancestors.length) {
    if (!current) {
      current = ancestors.pop()?.nextSibling || null;
      continue;
    }

    if (isText(current)) {
      current = current.nextSibling;
      continue;
    }

    if (isElement(current) && current.matches(selector)) {
      const temp = current.firstChild;
      current.replaceWith(...Array.from(current.childNodes));
      current = temp;
      continue;
    }

    ancestors.push(current);
    current = current.firstChild;
  }

  if (clearRoot && isElement(root) && root.matches(selector)) {
    const { firstChild } = root;
    root.replaceWith(...Array.from(root.childNodes));
    return firstChild;
  }

  return root;
};
