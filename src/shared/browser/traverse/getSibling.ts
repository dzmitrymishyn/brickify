export const getSibling = (node: Node | null, isNext: boolean): Node | null => (
  isNext ? node?.nextSibling : node?.previousSibling
) ?? null;
