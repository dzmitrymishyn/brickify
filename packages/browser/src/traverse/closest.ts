import { isElement } from '../utils';

export const closest = (node: Node | null, selector: string, container?: Node | null) => {
  let current: Node | null = node?.parentNode ?? null;

  while (current && current !== container) {
    if (isElement(current) && current.matches(selector)) {
      return current;
    }
    current = current.parentNode ?? null;
  }

  return null;
};
