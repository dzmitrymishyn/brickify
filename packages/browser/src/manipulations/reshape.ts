import { pipe } from 'fp-ts/lib/function';

import { expose } from './expose';
import { type Component } from './models';
import { surround } from './surround';
import { makeRangeWithinContainer } from './wrapContainerForReshape';
import { closest } from '../traverse';

type Action = 'surround' | 'expose';

const actions = {
  surround,
  expose,
} as const;

const getType = (
  component: Component,
  range: Range,
  container?: HTMLElement | null,
) => pipe(
  container
    ? makeRangeWithinContainer(range)(container)
    : range,
  ({ startContainer }) => (
    closest(startContainer, component.selector, container)
      ? 'expose'
      : 'surround'
  ),
);

export const reshape = (
  component: Component,
  range: Range,
  container?: HTMLElement | null,
  forceActionType?: Action,
) => pipe(
  forceActionType ?? getType(component, range, container),
  (type) => ({
    type,
    range: actions[type](component, range, container),
  }),
);
