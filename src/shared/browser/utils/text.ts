export const isText = (node?: Node | null): node is Text => node?.nodeType === Node.TEXT_NODE;

export const splitIfText = (node: Node, offset: number) => {
  const textLength = node.textContent?.length || 0;

  if (isText(node) && offset < textLength && offset > 0) {
    return node.splitText(offset);
  }

  return node;
};

export const splitBoundaryText = (range: Range) => {
  const newRange = range.cloneRange();
  newRange.setStart(splitIfText(newRange.startContainer, newRange.startOffset), 0);
  splitIfText(newRange.endContainer, newRange.endOffset);
  return newRange;
};
