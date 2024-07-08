import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { getSelection } from './selection';
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
      ?? (
        isText(endContainer)
          ? endContainer.textContent?.length
          : endContainer.childNodes.length
      )
      ?? 0
    ),
  );

  return range;
};

export const getRange = flow(
  getSelection,
  O.map((selection) => (
    selection.rangeCount > 0
      ? selection.getRangeAt(0)
      : null
  )),
  O.toNullable,
);

export const addRange = flow(
  O.fromNullable<Range | null>,
  O.bindTo('newRange'),
  O.bind('selection', getSelection),
  O.map(({ selection, newRange }) => {
    selection.removeAllRanges();
    selection.addRange(newRange);
    return true;
  }),
  O.getOrElse(() => false),
);

export const isElementWithinRange = (element: Node, range: Range) => {
  if (isText(element)) {
    return (
      range.comparePoint(element, 0) <= 0 &&
      range.comparePoint(element, element.textContent?.length ?? 0) >= 0
    );
  }

  return (
    range.comparePoint(element, 0) <= 0 &&
    range.comparePoint(element, element.childNodes.length) >= 0
  );
};
