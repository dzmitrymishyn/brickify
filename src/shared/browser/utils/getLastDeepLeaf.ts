export const getLastDeepLeaf = <T extends Node | null>(node: T): T => {
  let current: Node | null = node;
  while (current?.childNodes.length) {
    current = current.childNodes.item(current.childNodes.length - 1);
  }
  return current as T;
};
