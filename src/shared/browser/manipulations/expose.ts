import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import {
  reduce,
  tap,
} from '@/shared/operators';

import { Component } from './models';
import { wrapToNode } from './wrapToNode';
import { createRange } from '../selection';
import { getSibling } from '../traverse';
import {
  clearNodes,
  splitBoundaryText,
} from '../utils';

const createPath = (start: Node, container: Node) => pipe(
  start,
  reduce([] as (Node | null)[], (acc, current) => [
    [...acc, current],
    current.parentNode === container ? null : current.parentNode,
  ]),
  (arr) => arr.reverse(),
);

const exposeSiblings = (
  component: Component,
  start: Node | null = null,
  end: Node | null = null,
  forceExpose = false,
) => {
  const parentContainer = start?.parentElement ?? null;
  const parentMatched = parentContainer?.matches(component.selector);

  if (
    !parentContainer
    || (end && end.parentElement !== parentContainer)
    || (!forceExpose && !parentMatched)
  ) {
    return false;
  }

  const afterEnd: Node | null = end?.nextSibling ?? null;
  const nextContainer = parentContainer.cloneNode(false) as Element;
  parentContainer.insertAdjacentElement('afterend', nextContainer);

  const currentContainer = !parentMatched && forceExpose
    ? parentContainer.cloneNode(false) as Element
    : null;

  if (currentContainer) {
    parentContainer.insertAdjacentElement('afterend', currentContainer);
  }

  {
    let current: Node | null = start;

    while (current) {
      const currentChild: Node = current;
      current = getSibling(current, true);

      if (currentContainer) {
        currentContainer.append(currentChild);
      } else {
        parentContainer.parentElement?.insertBefore(currentChild, nextContainer);
      }

      if (currentChild === end) {
        break;
      }
    }
  }

  if (afterEnd) {
    let current: Node | null = afterEnd;
    while (current) {
      const next: Node | null = current.nextSibling;
      nextContainer.append(current);
      current = next;
    }
  }

  if (!parentContainer?.childNodes.length) {
    parentContainer?.remove();
  }

  if (!nextContainer?.childNodes.length) {
    nextContainer?.remove();
  }

  return parentMatched ? 'parent-removed' : 'parent-replaced';
};

const clearSiblings = (selector: string, start?: Node | null, end?: Node | null) => {
  let current: Node | null = start ?? null;
  while (current && current !== end) {
    const { nextSibling } = current;
    clearNodes(current, selector, true);
    current = nextSibling;
  }
};

export const expose = (
  component: Component,
  inputRange: Range,
  container: HTMLElement,
) => (inputRange.collapsed ? inputRange : pipe(
  splitBoundaryText(inputRange),
  ({ startContainer, endContainer }) => ({ startContainer, endContainer }),
  I.bind('leftPath', ({ startContainer }) => createPath(startContainer, container)),
  I.bind('rightPath', ({ endContainer }) => createPath(endContainer, container)),
  tap(({ leftPath, rightPath }) => {
    let leftMatched = false;
    let rightMatched = false;

    for (let i = 1; i < Math.max(leftPath.length, rightPath.length); i += 1) {
      const leftParent = leftPath.at(i);
      const leftChild = leftPath.at(i + 1);
      const rightParent = rightPath.at(i);
      const rightChild = rightPath.at(i + 1);

      if (leftMatched && leftParent && leftChild !== leftParent.firstChild && leftChild) {
        wrapToNode(component.create(), leftParent.firstChild!, leftChild.previousSibling);
      }

      if (rightMatched && rightParent && rightChild && rightChild !== rightParent.lastChild) {
        wrapToNode(component.create(), rightChild.nextSibling!);
      }

      if (leftParent === rightParent) {
        if (leftChild && leftChild !== rightChild && leftChild?.nextSibling !== rightChild) {
          clearSiblings(component.selector, leftChild.nextSibling, rightChild);
        }
        if (exposeSiblings(component, leftChild, rightChild)) {
          leftMatched = true;
          rightMatched = true;
        }
        // eslint-disable-next-line no-continue
        continue;
      }

      if (leftParent) {
        clearSiblings(component.selector, leftChild?.nextSibling);
        leftMatched = !!exposeSiblings(component, leftChild) || leftMatched;
      }

      if (rightParent) {
        clearSiblings(component.selector, rightParent.firstChild, rightChild);
        rightMatched = !!exposeSiblings(component, rightParent.firstChild, rightChild)
          || rightMatched;
      }
    }
  }),
  ({ startContainer, endContainer }) => createRange(startContainer, endContainer),
));
