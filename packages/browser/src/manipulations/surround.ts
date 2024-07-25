import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import { clearNodes } from './clearNodes';
import { type Component } from './models';
import { prepareRange } from './prepareRange';
import { wrapToNode } from './wrapToNode';
import { createRange, isElementWithinRange } from '../selection';
import { getSibling } from '../traverse';
import { getFirstDeepLeaf, getLastDeepLeaf, isText } from '../utils';

const surroundAscendedUntilPath = (
  startNode: Node,
  container: Node,
  { component, ltr = false }: {
    component: Component;
    ltr?: boolean;
  },
) => {
  let current: Node | null = startNode;

  do {
    const parent: Node | null = current.parentNode;

    if (!parent || !current) { break; }

    if (parent === container || current === container) {
      return current;
    }

    if (
      (ltr && parent.firstChild === current)
      || (!ltr && parent.lastChild === current)
    ) {
      current = parent;

      continue;
    }

    const wrapper = component.create();
    wrapToNode(wrapper, current, null, ltr);
    clearNodes(wrapper, component.selector);

    while (
      current
      && !getSibling(current, ltr)
      && current.parentNode !== container
    ) {
      current = current.parentNode ?? null;
    }

    current = getSibling(current, ltr);
  } while (current);

  return current;
};

export const surround = (
  component: Component,
  inputRange: Range,
  container?: HTMLElement | null,
) => (inputRange.collapsed ? inputRange : pipe(
  container,
  () => {
    if (!container) {
      return inputRange;
    }

    const firstNode = getFirstDeepLeaf(container)!;
    const lastNode = getLastDeepLeaf(container)!;

    const newRange = new Range();

    if (isElementWithinRange(inputRange, firstNode)) {
      newRange.setStart(
        firstNode,
        firstNode === inputRange.startContainer ? inputRange.startOffset : 0,
      );
    } else {
      newRange.setStart(inputRange.startContainer, inputRange.startOffset);
    }

    if (isElementWithinRange(inputRange, lastNode)) {
      newRange.setEnd(
        lastNode,
        // eslint-disable-next-line no-nested-ternary -- test
        lastNode === inputRange.endContainer
          ? inputRange.endOffset
          : isText(lastNode)
            ? lastNode.textContent?.length ?? 0
            : lastNode.childNodes.length - 1,
      );
    } else {
      newRange.setEnd(inputRange.endContainer, inputRange.endOffset);
    }

    return newRange;
  },
  prepareRange,
  ({ startContainer, endContainer, commonAncestorContainer }) => pipe(
    I.Do,
    I.bind('start', () => surroundAscendedUntilPath(
      startContainer,
      commonAncestorContainer,
      { component, ltr: true },
    )),
    I.bind('end', () => surroundAscendedUntilPath(
      endContainer,
      commonAncestorContainer,
      { component, ltr: false },
    )),
    ({ start, end }) => {
      if (start?.parentElement) {
        const wrapper = component.create();
        wrapToNode(wrapper, start, end);
        clearNodes(wrapper, component.selector);
      }
      return { startContainer, endContainer };
    },
  ),
  ({ startContainer, endContainer }) =>
    createRange(startContainer, endContainer),
));
