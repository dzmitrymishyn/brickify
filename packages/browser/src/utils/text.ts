export const isText = (node?: Node | null): node is Text =>
  node?.nodeType === Node.TEXT_NODE;

export const splitIfText = (node: Node, offset: number) => {
  const textLength = node.textContent?.length || 0;

  if (isText(node) && offset < textLength && offset > 0) {
    return node.splitText(offset);
  }

  return node;
};

export const splitBoundaryText = (range: Range) => {
  const clonedRange = range.cloneRange();
  const startContainer = splitIfText(
    clonedRange.startContainer,
    clonedRange.startOffset,
  );

  clonedRange.setStart(
    startContainer,
    // If it's the same node it means that we don't split it and it could be
    // the end of a node. In this case we need to use previous start offset.
    startContainer === clonedRange.startContainer
      ? clonedRange.startOffset
      : 0,
  );
  splitIfText(clonedRange.endContainer, clonedRange.endOffset);

  return clonedRange;
};
