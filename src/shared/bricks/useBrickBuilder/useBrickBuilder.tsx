import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as R from 'fp-ts/lib/Reader';
import { ReactElement, ReactNode, useMemo } from 'react';

import { array, tap } from '@/shared/operators';

import { BrickCacheValue, Cache, useCache } from './cache';
import { fromCacheOrCreate } from './getters';
import { makeGeneratedBrick } from './utils';
import {
  Brick,
  BrickValue,
  hasSlots,
  isBrick,
  isBrickValue,
  isChildrenFitBrick,
  Slot,
} from '../utils';

type Deps = {
  cache: Cache;
  iteractionUid: Symbol;
};

type Results = ReactElement[] | null;

const prepareSlotForProps = ([key, bricks]: Slot) => pipe(
  R.ask<Deps & {
    cached?: BrickCacheValue;
    value: BrickValue<string | Symbol>;
    uid: string;
  }>(),
  R.map(({ iteractionUid, cache, cached, value, uid }) => {
    if (key in value) {
      const slotValue = (value as Record<string, unknown>)[key];
      const children = cached?.value?.[key] === slotValue
        ? cached?.element?.props?.[key] as Results
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        : traverse(slotValue, bricks || [], `${uid}-${key}`)({ iteractionUid, cache });
      return {
        [key]: Array.isArray(children) && children.length
          ? children
          : null,
      };
    }

    return { [key]: null };
  }),
);

const render = (
  value: BrickValue<string | Symbol> & { children?: unknown },
  Component: Brick,
  uid: string,
) => pipe(
  R.ask<Deps>(),
  R.map(({ cache, iteractionUid }) => pipe(
    O.fromNullable(cache.get(value)),
    O.map(({ element }) => [element]),
    O.getOrElse(() => pipe(
      cache.get(uid),
      (cached) => {
        const { brick, ...props } = value;
        return { cache, uid, Component, props, cached, value, iteractionUid };
      },
      (deps): Results => pipe(
        hasSlots(Component) ? Component.slots : null,
        O.fromNullable,
        O.map(A.reduce(deps.props || {}, (acc, slot) => ({
          ...acc,
          ...prepareSlotForProps(slot)(deps),
        }))),
        O.fold(
          () => deps,
          (newProps) => ({ ...deps, props: newProps }),
        ),
        fromCacheOrCreate(value),
        tap((element) => {
          cache.add(uid, { element, Component, value, iteractionUid });
          cache.add(value, { element, Component, value: { brick: 'test' }, iteractionUid });
        }),
        (element) => [element],
      ),
    )),
  )),
);

function traverse(
  inputValue: unknown,
  bricks: Brick[] = [],
  prefix: string = '',
) {
  return pipe(
    R.ask<Deps>(),
    R.map((deps): Results => pipe(
      O.fromNullable(inputValue),
      O.map(array),
      O.map(A.reduceWithIndex<unknown, ReactElement[]>(
        [],
        (index, acc, value) => {
          const isBrickVal = isBrickValue(value);
          const isNeededBrick = isBrickVal ? flow(
            O.fromPredicate(isBrick),
            O.map(({ brick }) => brick === value.brick),
            O.getOrElse(() => false),
          ) : isChildrenFitBrick(value);

          return pipe(
            bricks,
            A.findFirst(isNeededBrick),
            O.map((Component) => render(
              isBrickVal ? value : makeGeneratedBrick(value),
              Component,
              `${prefix}-${index}`,
            )),
            O.ap(O.some(deps)),
            O.chain(O.fromNullable),
            O.map((elements) => {
              acc.push(...elements);
              return acc;
            }),
            O.getOrElse(() => acc),
          );
        },
      )),
      O.getOrElse<Results>(() => null),
    )),
  );
}

export const useBricksBuilder = (
  value: unknown,
  bricks: Brick[] = [],
): ReactNode => {
  const cache = useCache();

  return useMemo(
    () => traverse(value, bricks, '')({
      iteractionUid: Symbol('Render iteration unique object'),
      cache,
    }),
    [cache, bricks, value],
  );
};
