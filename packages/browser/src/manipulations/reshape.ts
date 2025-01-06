import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { expose } from './expose';
import { type Component } from './models';
import { surround } from './surround';
import { makeRangeWithinContainer } from './wrapContainerForReshape';
import { closest } from '../traverse';

export type ReshapeVariant = 'surround' | 'expose';

const actions = {
  surround,
  expose,
} as const;

export const getReshapeType = (
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
  forceActionType?: ReshapeVariant,
): { type?: string; range: Range } => pipe(
  forceActionType ?? getReshapeType(component, range, container),
  (type) => pipe(
    O.fromNullable(actions[type](component, range, container)),
    O.map((nextRange) => ({ type, range: nextRange })),
    O.getOrElseW(() => ({ range }))
  ),
);
