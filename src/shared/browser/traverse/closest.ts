import { isElement } from '../utils';

export const closest = (node: Node, selector: string, container?: Node | null) => {
  let current: Node | null = node?.parentNode;

  while (current && current !== container) {
    if (isElement(current) && current.matches(selector)) {
      return current;
    }
    current = current?.parentNode ?? null;
  }

  return null;
};
