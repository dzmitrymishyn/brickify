import { tap } from '@brickifyio/operators';
import { pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';

import { expose } from './expose';
import { type Component } from './models';
import { surround } from './surround';
import { fromRangeCopy, toRangeCopy } from '../selection';
import { closest } from '../traverse';

type Action = 'surround' | 'expose';

const actions = {
  surround,
  expose,
} as const;

export const reshape = (
  component: Component,
  range: Range,
  container?: HTMLElement | null,
  forceActionType?: Action,
) => pipe(
  toRangeCopy(range),
  I.bindTo('rangeCopy'),
  I.bind(
    'type',
    (): Action => forceActionType ?? (
      closest(range.startContainer, component.selector, container)
        ? 'expose'
        : 'surround'
    )
  ),
  tap(({ type }) => actions[type](component, range, container)),
  ({ type, rangeCopy }) => ({
    type,
    range: pipe(
      rangeCopy,
      fromRangeCopy,
    ),
  }),
);
