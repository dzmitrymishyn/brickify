import { isText } from '../utils';

export const createRange = (
  startContainer: Node,
  endContainer: Node,
  startOffset?: number,
  endOffset?: number,
) => {
  const range = new Range();

  range.setStart(startContainer, startOffset ?? 0);
  range.setEnd(
    endContainer,
    (
      endOffset
      ?? (isText(endContainer) ? endContainer.textContent?.length : endContainer.childNodes.length)
      ?? 0
    ),
  );

  return range;
};
