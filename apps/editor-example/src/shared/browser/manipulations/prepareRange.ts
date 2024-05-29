import { flow } from 'fp-ts/lib/function';

import { isElement, splitBoundaryText } from '../utils';

export const prepareRange = flow(
  splitBoundaryText,
  (range) => {
    if (isElement(range.startContainer) && range.startOffset !== 0) {
      range.setStart(range.startContainer.childNodes[range.startOffset], 0);
    }

    if (
      isElement(range.endContainer)
      && range.endOffset !== 0
    ) {
      range.setEnd(range.endContainer.childNodes[range.endOffset - 1], 0);
    }

    return range;
  },
);
