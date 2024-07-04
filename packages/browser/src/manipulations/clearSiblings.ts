import { clearNodes } from './clearNodes';

export const clearSiblings = (
  selector: string,
  start?: Node | null,
  end?: Node | null,
) => {
  let current: Node | null = start ?? null;
  while (current && current !== end) {
    const { nextSibling } = current;
    clearNodes(current, selector, true);
    current = nextSibling;
  }
};
