export const getPreviousPossibleSibling = (
  node: Node,
  container?: Node,
): Node | null => {
  let current: Node | null = node;
  while (current && container !== current && !current.previousSibling) {
    current = current.parentNode;
  }
  return current === container ? null : (current?.previousSibling ?? null);
};
