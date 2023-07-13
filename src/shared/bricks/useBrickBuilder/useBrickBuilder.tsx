import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import { ReactNode, useMemo } from 'react';

import { array, tap } from '@/shared/operators';

import { BrickCacheValue, Cache, useCache } from './cache';
import { getOrCreateElement } from './getters';
import { BuildResults, makeGeneratedBrick } from './utils';
import {
  Brick,
  BrickValue,
  hasSlots,
  isBrick,
  isBrickValue,
  isChildrenFitBrick,
  Slot,
} from '../utils';

const handleSlot = ([key, bricks]: Slot) => pipe(
  R.ask<{
    cache: Cache<BrickCacheValue>,
    cached?: BrickCacheValue,
    value: BrickValue<string | Symbol>,
    uid: string,
  }>(),
  R.map(({ cache, cached, value, uid }) => {
    if (key in value) {
      const slotValue = (value as Record<string, unknown>)[key];
      return cached?.value?.[key] === slotValue
        ? cached?.element?.props?.[key]
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        : traverse(cache, slotValue, bricks || [], `${uid}-${key}`).elements;
    }

    return null;
  }),
);

const render = (
  cache: Cache<BrickCacheValue>,
  value: BrickValue<string | Symbol> & { children?: unknown },
  uid: string,
) => (Component: Brick): BuildResults => pipe(
  O.fromNullable(cache.get(value)),
  O.fold(
    () => pipe(
      cache.get(uid),
      (cached) => {
        const { brick, ...props } = value;
        return { cache, uid, Component, props, cached, value };
      },
      (deps): BuildResults => pipe(
        hasSlots(Component) ? Component.slots : null,
        O.fromNullable,
        O.map(A.reduce(deps.props, (acc, slot) => ({
          ...acc,
          [slot[0]]: handleSlot(slot)(deps),
        }))),
        O.getOrElse(() => deps.props),
        (props) => getOrCreateElement(value)({ ...deps, props }),
        tap(({ element }) => {
          cache.add(uid, { element, Component, value });
          cache.add(value, { element, Component, value });
        }),
        ({ element, dirty }) => ({ elements: [element], dirty }),
      ),
    ),
    ({ element }): BuildResults => ({ dirty: false, elements: [element] }),
  ),
);

function traverse(
  cache: Cache<BrickCacheValue>,
  inputValue: unknown,
  bricks: Brick[] = [],
  prefix: string = '',
): BuildResults {
  return pipe(
    O.fromNullable(inputValue),
    O.map(array),
    O.map(A.reduceWithIndex<unknown, BuildResults>({ dirty: false, elements: [] }, (index, acc, value) => {
      const uid = `${prefix}-${index}`;

      const isBrickVal = isBrickValue(value);
      const isNeededBrick = isBrickVal ? flow(
        O.fromPredicate(isBrick),
        O.map(({ brick }) => brick === value.brick),
        O.getOrElse(() => false),
      ) : isChildrenFitBrick(value);

      const normalizedValue = isBrickVal ? value : makeGeneratedBrick(value);

      return pipe(
        bricks,
        A.findFirst(isNeededBrick),
        O.map(render(cache, normalizedValue, uid)),
        O.map(({ dirty, elements }) => {
          if (Array.isArray(elements) && elements.length) {
            acc.elements?.push(...elements);
            acc.dirty = acc.dirty || dirty;
          }
          return acc;
        }),
        O.getOrElseW(() => acc),
      );
    })),
    O.getOrElse<BuildResults>(() => ({ dirty: false, elements: null })),
  );
}

export const useBricksBuilder = (
  value: unknown,
  bricks: Brick[] = [],
): ReactNode => {
  const cache = useCache<BrickCacheValue>();

  return useMemo(
    () => traverse(cache, value, bricks, '').elements,
    [cache, bricks, value],
  );
};
