import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import { clearNodes } from './clearNodes';
import { type Component } from './models';
import { wrapContainerReshape } from './wrapContainerForReshape';
import { wrapToNode } from './wrapToNode';
import { createRange } from '../selection';
import { getSibling } from '../traverse';

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

const surroundFactory = (
  component: Component,
) => (
  { startContainer, endContainer, commonAncestorContainer }: Range,
) => pipe(
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
  },
  () => createRange(startContainer, endContainer),
);

export const surround = (
  component: Component,
  range: Range,
  container?: HTMLElement | null,
) => pipe(
  surroundFactory(component),
  wrapContainerReshape,
  (reshape) => reshape(range, container),
);
