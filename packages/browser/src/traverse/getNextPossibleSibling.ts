export const getNextPossibleSibling = (
  node: Node,
  container?: Node,
): Node | null => {
  let current: Node | null = node;
  while (current && container !== current && !current.nextSibling) {
    current = current.parentNode;
  }
  return current === container ? null : (current?.nextSibling ?? null);
};
