export const isElement = (
  node?: Node | null,
): node is Element => node?.nodeType === Node.ELEMENT_NODE;

export const isBr = (node?: Node | null): node is HTMLBRElement =>
  isElement(node) && node.nodeName === 'BR';
