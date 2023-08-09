export const isText = (node?: Node | null): node is Text => node?.nodeType === Node.TEXT_NODE;

export const splitIfText = (node: Node, offset: number) => {
  if (isText(node) && offset !== 0 && offset !== node.textContent?.length) {
    return node.splitText(offset);
  }

  return node;
};

export const splitBoundaryText = (range: Range) => {
  range.setStart(splitIfText(range.startContainer, range.startOffset), 0);
  splitIfText(range.endContainer, range.endOffset);
};
