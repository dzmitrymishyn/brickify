import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as R from 'fp-ts/lib/Reader';

import {
  loopUntil,
  tap,
} from '@/shared/operators';

import { Component } from './models';
import { createRange } from '../selection';
import { getSibling } from '../traverse';
import {
  clearNodes,
  isElement,
  splitBoundaryText,
} from '../utils';

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
    || end?.parentElement !== parentContainer
    || (!forceExpose && !parentMatched)
  ) {
    return;
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
};

const exposeUntilCommonContainer = (
  node: Node,
  container: Node,
  component: Component,
  ltr = true,
): Node | null | undefined => loopUntil(
  (current: Node) => {
    const { parentElement } = current;
    const start: Node | null = (ltr ? current : parentElement?.firstChild) || null;
    const end: Node | null = (ltr ? parentElement?.lastChild : current) || null;

    exposeSiblings(component, start, end);

    return container === current || container === current.parentElement;
  },
  (current) => current.parentElement,
)(node);

const exposeRangeUntilCommonContainer = pipe(
  R.ask<{ component: Component }>(),
  R.map(({ component }) => flow(
    ({ startContainer, endContainer, commonAncestorContainer }: Range) => ({
      startContainer, endContainer, commonAncestorContainer,
    }),
    I.bind('start', ({ startContainer, commonAncestorContainer }) => exposeUntilCommonContainer(
      startContainer,
      commonAncestorContainer,
      component,
    )),
    I.bind('end', ({ endContainer, commonAncestorContainer }) => exposeUntilCommonContainer(
      endContainer,
      commonAncestorContainer,
      component,
      false,
    )),
    tap(({ start, end }) => pipe(
      start,
      loopUntil(
        (current) => {
          clearNodes(current, component.selector, true);
          return current === end;
        },
        (current) => getSibling(current),
      ),
    )),
  )),
);

export const expose = (
  component: Component,
  inputRange: Range,
  container: HTMLElement,
) => pipe(
  splitBoundaryText(inputRange),
  exposeRangeUntilCommonContainer({ component }),
  tap(flow(
    ({ start, end }) => ({ start, end }),
    loopUntil(
      flow(
        I.bind('forceExpose', ({ start }) => !!pipe(
          start,
          loopUntil(
            (current) => isElement(current) && current.matches(component.selector),
            (current) => current?.parentElement !== container && current.parentElement,
          ),
        )),
        tap(({ start, end, forceExpose }) => exposeSiblings(component, start, end, forceExpose)),
        ({ start, end }) => container
          && [start, start?.parentElement, end, end?.parentElement].includes(container),
      ),
      ({ start, end }) => {
        if (!start || !end) {
          return null;
        }

        return start?.parentElement?.matches(component.selector)
          ? { start, end }
          : { start: start?.parentElement, end: end?.parentElement };
      },
    ),
  )),
  ({ startContainer, endContainer }) => createRange(startContainer, endContainer),
);
