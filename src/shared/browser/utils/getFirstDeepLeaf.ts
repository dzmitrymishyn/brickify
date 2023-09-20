export const getFirstDeepLeaf = <T extends Node | null>(node: T): T => {
  let current: Node | null = node;
  while (current?.childNodes.length) {
    current = current.childNodes.item(0);
  }
  return current as T;
};
