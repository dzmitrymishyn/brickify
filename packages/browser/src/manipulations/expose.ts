import { tap } from '@brickifyio/operators';
import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import { clearSiblings } from './clearSiblings';
import { type Component } from './models';
import { prepareRange, restoreRange } from './prepareRange';
import { wrapToNode } from './wrapToNode';
import { createRange, fromRangeCopy, isRangeWithinContainer, toRangeCopy } from '../selection';
import { getSibling } from '../traverse';
import { createPath } from '../utils';

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
        parentContainer.parentElement?.insertBefore(
          currentChild,
          nextContainer,
        );
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

  if (!parentContainer.childNodes.length) {
    parentContainer.remove();
  }

  if (!nextContainer.childNodes.length) {
    nextContainer.remove();
  }

  return parentMatched ? 'parent-removed' : 'parent-replaced';
};

export const expose = flow(
  (
    component: Component,
    range: Range,
    container?: HTMLElement | null,
  ) => ({
    range: prepareRange(range, container),
    rangeWithinContainer: isRangeWithinContainer(range, container),
    rangeCopy: toRangeCopy(range),
    component,
    container,
  }),
  ({
    range: { startContainer, endContainer, collapsed },
    rangeCopy,
    rangeWithinContainer,
    container,
    component,
  }) => collapsed ? fromRangeCopy(rangeCopy) : pipe(
    I.Do,
    I.bind('leftPath', () =>
      createPath(startContainer, container)),
    I.bind('rightPath', () =>
      createPath(endContainer, container)),
    tap(({ leftPath, rightPath }) => {
      let leftMatched = false;
      let rightMatched = false;

      for (let i = 0; i < Math.max(leftPath.length, rightPath.length); i += 1) {
        const leftParent = leftPath.at(i);
        const leftChild = leftPath.at(i + 1);
        const rightParent = rightPath.at(i);
        const rightChild = rightPath.at(i + 1);

        if (
          leftMatched
          && leftParent
          && leftChild !== leftParent.firstChild
          && leftChild
        ) {
          wrapToNode(
            component.create(),
            leftParent.firstChild!,
            leftChild.previousSibling,
          );
        }

        if (
          rightMatched
          && rightParent
          && rightChild
          && rightChild !== rightParent.lastChild
        ) {
          wrapToNode(component.create(), rightChild.nextSibling!);
        }

        if (leftParent === rightParent) {
          if (
            leftChild
            && leftChild !== rightChild
            && leftChild.nextSibling !== rightChild
          ) {
            clearSiblings(component.selector, leftChild.nextSibling, rightChild);
          }
          if (exposeSiblings(component, leftChild, rightChild)) {
            leftMatched = true;
            rightMatched = true;
          }

          continue;
        }

        if (leftParent) {
          clearSiblings(component.selector, leftChild?.nextSibling);
          leftMatched = Boolean(exposeSiblings(component, leftChild))
            || leftMatched;
        }

        if (rightParent) {
          clearSiblings(component.selector, rightParent.firstChild, rightChild);
          rightMatched = Boolean(
            exposeSiblings(component, rightParent.firstChild, rightChild)
          ) || rightMatched;
        }
      }
    }),
    () => restoreRange(
      rangeCopy,
      createRange(startContainer, endContainer),
      rangeWithinContainer,
    ),
  ),
);
