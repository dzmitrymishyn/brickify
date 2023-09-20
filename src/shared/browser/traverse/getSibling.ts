export const getSibling = (node?: Node | null, isNext: boolean = true): Node | null => (
  isNext ? node?.nextSibling : node?.previousSibling
) ?? null;
