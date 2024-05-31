export const getSibling = (node?: Node | null, isNext = true): Node | null => (
  isNext ? node?.nextSibling : node?.previousSibling
) ?? null;
