export const closestUntilChildOfParent = (node: Node, parent: Node) => {
  let current: Node | null = node;
  while (current && current.parentNode !== parent) {
    current = current.parentNode;
  }
  return current;
};
