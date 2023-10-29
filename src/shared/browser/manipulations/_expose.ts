/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as E from 'fp-ts/lib/Either';
import { flow, identity, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';

import {
  debug,
  loop,
  loopUntil,
  reduce,
  tap,
} from '@/shared/operators';

import { Component } from './models';
import { createRange } from '../selection';
import { closestUntilChildOfParent, getSibling } from '../traverse';
import {
  clearNodes,
  getFirstDeepLeaf,
  getLastDeepLeaf,
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

const getNextPossibleSiblingUntilContainer = (
  node: Node | null,
  container: Node,
  isNext: boolean = true,
) => {
  let current: Node | null = node;
  let temp: Node | null = node;

  do {
    current = current ?? temp;
    temp = current?.parentNode ?? null;
    current = getSibling(current, isNext) ?? getSibling(current?.parentNode, isNext);
  } while (!current && temp?.parentNode !== container);

  return current ?? temp;
};

const exposeUntilCommonContainer = (
  node: Node,
  container: Node,
  component: Component,
  ltr = true,
): Node | null => pipe(
  node,
  E.fromPredicate(
    () => node && node !== container && node.parentElement !== container,
    () => node,
  ),
  E.chainW((currentNode) => {
    let current: Node | null = currentNode;
    let temp: Node | null = currentNode;

    do {
      current = temp;
      temp = getNextPossibleSiblingUntilContainer(current, container, ltr);
      current = clearNodes(current!, component.selector, true);
    } while (!current && temp?.parentElement !== container);

    if (!current && temp) {
      current = temp;
      temp = temp?.nextSibling ?? null;
      return E.fromNullable(null)(clearNodes(current, component.selector, true) ?? temp);
    }

    return E.fromNullable(null)(current);
  }),
  E.map(reduce(
    (_, current: Node) => {
      const { parentElement } = current;
      const start: Node | null = (ltr ? current : parentElement?.firstChild) || null;
      const end: Node | null = (ltr ? parentElement?.lastChild : current) || null;
      const exposed = exposeSiblings(component, start, end);
      const next = exposed ? current : current.parentElement;
      const stopLoop = !next || container === next || container === next?.parentElement;

      if (!stopLoop) {
        let c = next.nextSibling;

        while (c) {
          clearNodes(c, component.selector, true);
          c = c?.nextSibling;
        }
      }

      return [
        next,
        !stopLoop && next,
      ];
      // return exposeSiblings(component, start, end) ? current : current.parentElement;
      // return container === current || container === current.parentElement;
    },
    // (current) => current.parentElement,
    null as Node | null,
  )),
  // E.map((a) => ''),
  // E.map((a) => ''),
  E.getOrElse(identity),
);

const exposeRangeUntilCommonContainer = pipe(
  R.ask<{ component: Component }>(),
  // R.map(tap(({ component }) => {
  //   const el = document.createElement('div');
  //   // eslint-disable-next-line @typescript-eslint/quotes
  //   el.innerHTML = `<b class="1"><b class="2"><b class="3"><b class="4"><b class="test"></b></b><b class="32"></b></b><b class="22"></b></b></b><b></b>`;
  //   // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  //   `
  //     <b class="1">
  //       <b class="2">
  //         <b class="3">
  //           <b class="4">
  //             <b class="test"></b>
  //           </b>
  //           <b class="32"></b>
  //         </b>
  //         <b class="22"></b>
  //       </b>
  //     </b>
  //     <b></b>
  //   `;
  //   const start = el.querySelector('.test')!;
  //   debugger;
  //   exposeUntilCommonContainer(start, el, component, true);
  // })),
  R.map(({ component }) => flow(
    ({ startContainer, endContainer, commonAncestorContainer }: Range) => ({
      startContainer, endContainer, commonAncestorContainer,
    }),
    I.bind('start', flow(
      ({ startContainer, commonAncestorContainer }) => exposeUntilCommonContainer(
        startContainer,
        commonAncestorContainer,
        component,
      ),
      // O.getOrElse((a) => a),
    )),
    I.bind('end', ({ endContainer, commonAncestorContainer, start }) => (
      start && exposeUntilCommonContainer(
        endContainer,
        commonAncestorContainer,
        component,
        false,
      )
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

export const expose2 = (
  component: Component,
  inputRange: Range,
  container: HTMLElement,
) => (inputRange.collapsed ? inputRange : pipe(
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
));

const createPath = (start: Node, container: Node) => pipe(
  start,
  reduce([] as (Node | null)[], (acc, current) => [
    [...acc, current],
    current.parentNode === container ? null : current.parentNode,
  ]),
  (arr) => arr.reverse(),
);

const closest = (node: Node, selector: string, parent?: Node) => {
  let current: Node | null = node;

  while (current && current !== parent) {
    if (isElement(current) && current.matches(selector)) {
      return current;
    }
    current = current.parentNode;
  }

  return isElement(parent) && parent.matches(selector) ? parent : null;
};

export const expose = (
  component: Component,
  inputRange: Range,
  container: HTMLElement,
) => (inputRange.collapsed ? inputRange : pipe(
  splitBoundaryText(inputRange),
  ({ startContainer, endContainer, commonAncestorContainer }) => ({
    startContainer: getFirstDeepLeaf(startContainer)!,
    endContainer: getLastDeepLeaf(endContainer)!,
    commonAncestorContainer,
  }),
  I.bind('start', ({ startContainer, commonAncestorContainer }) => {
    debugger;
    let startCurrent: Node | null = startContainer;
    let parent = closest(startCurrent!, component.selector, commonAncestorContainer);
    while (parent && startCurrent?.parentNode !== commonAncestorContainer) {
      startCurrent = exposeSiblings(component, startCurrent, null, true) === 'parent-removed'
        ? startCurrent
        : startCurrent?.parentNode ?? null;

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      startCurrent?.parentNode !== commonAncestorContainer && (() => {
        let current = startCurrent;
        while (current) {
          clearNodes(current, component.selector, true);
          current = current.nextSibling;
        }
      })();

      parent = closest(startCurrent!, component.selector, commonAncestorContainer);
      // startCurrent = parent === startCurrent?.parentNode ? startCurrent : startCurrent?.parentNode ?? null;
    }
    return startContainer === commonAncestorContainer ? startContainer : closestUntilChildOfParent(startContainer, commonAncestorContainer)!;
  }),
  I.bind('end', ({ endContainer, commonAncestorContainer }) => {
    debugger;
    let endCurrent: Node | null = endContainer;
    let parent = closest(endCurrent, component.selector, commonAncestorContainer);
    while (parent && endCurrent?.parentNode !== commonAncestorContainer) {
      endCurrent = exposeSiblings(component, endCurrent?.parentNode?.firstChild, endCurrent, true) === 'parent-removed'
        ? endCurrent
        : endCurrent?.parentNode ?? null;

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      endCurrent?.parentNode !== commonAncestorContainer && (() => {
        let current = endCurrent;
        while (current) {
          clearNodes(current, component.selector, true);
          current = current.previousSibling;
        }
      })();

      // exposeSiblings(component, endCurrent?.parentNode?.firstChild, endCurrent, true);
      parent = closest(endCurrent!, component.selector, commonAncestorContainer);
      // endCurrent = parent === endCurrent?.parentNode ? endCurrent : endCurrent?.parentNode ?? null;
    }
    return endContainer === commonAncestorContainer ? endContainer : closestUntilChildOfParent(endContainer, commonAncestorContainer)!;
  }),
  tap(({ start, end }) => {
    debugger;
    let startCurrent: Node | null = start;
    let endCurrent: Node | null = end;
    let parent = closest(startCurrent, component.selector, container);
    while (parent) {
      const exposeResults = exposeSiblings(component, startCurrent, endCurrent, true);
      if (exposeResults === 'parent-replaced') {
        startCurrent = startCurrent!.parentNode;
        endCurrent = endCurrent!.parentNode;
      }
      parent = closest(startCurrent!, component.selector, container);
    }
    // WE NEED TO CLEAR NODES AFTER THE ACTIONS!!!!!!!
    let current = startCurrent;
    while (current) {
      const temp = startCurrent === endCurrent;
      clearNodes(current, component.selector, true);
      current = current.previousSibling;
      if (temp) {
        break;
      }
    }
  }),
  ({ startContainer, endContainer }) => createRange(startContainer, endContainer),
));
