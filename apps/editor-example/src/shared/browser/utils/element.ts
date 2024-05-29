export const isElement = (
  node?: Node | null,
): node is Element => node?.nodeType === Node.ELEMENT_NODE;
