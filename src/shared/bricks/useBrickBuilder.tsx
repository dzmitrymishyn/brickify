/* eslint-disable @typescript-eslint/no-unused-vars */
import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import React, { ReactNode, useMemo } from 'react';

import { array } from '@/shared/operators';
import { Cache, useCache } from '@/shared/utils/cache';

import { Brick, BrickValue, hasSlots, isBrick, isBrickValue, isChildrenFitBrick, Slot } from './utils';

type BuildResults = {
  dirty: boolean;
  nodes?: ReactNode[] | null;
};

const generatedName = Symbol('generated');
const makeGeneratedBrick = (value: unknown) => ({ brick: generatedName, children: value });

const patchPropsWithSlots = (props: Record<string, unknown>) => ([key, info]: [string, BuildResults]) => {
  if (info.dirty) {
    props[key] = info.nodes;
  } else {
    Reflect.deleteProperty(props, key);
  }
};

const makeSlot = (
  cache: Cache<any, any>,
  cached: any,
  value: BrickValue<string | Symbol> & { children?: unknown },
  uid: string,
  [key, slots]: Slot,
): BuildResults => {
  if (key in value) {
    const slotValue = (value as Record<string, unknown>)[key];
    return cached?.value?.[key] === slotValue
      ? { dirty: false }
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      : traverse(cache, slotValue, slots || [], `${uid}-${key}`);
  }
  return { dirty: false, nodes: null };
};

const render = (
  cache: Cache<any, any>,
  value: BrickValue<string | Symbol> & { children?: unknown },
  uid: string,
) => (Component: Brick & Partial<Brick>): BuildResults => pipe(
  O.fromNullable(cache.get(value)),
  O.fold(
    () => pipe(
      cache.get(uid),
      (cached): BuildResults => {
        const { brick, ...props } = value;
        let dirty = true;

        if (hasSlots(Component)) {
          Component.slots
            .map<[string, BuildResults]>((slot) => [slot[0], makeSlot(cache, cached, value, uid, slot)])
            .forEach(patchPropsWithSlots(props));
        }

        let node: ReactNode;

        if (cached?.Component.brick === Component.brick) {
          if (value.brick === generatedName && value.children === cached.value.children) {
            node = cached.node;
            dirty = false;
          } else {
            node = React.cloneElement(cached.node, props);
          }
        }

        node = node || (
          <Component
            {...props}
            key={uid}
          />
        );

        cache.add(uid, { node, Component, value });
        cache.add(value, { node, Component, value });

        return { dirty, nodes: [node] };
      },
    ),
    ({ node }): BuildResults => ({ dirty: false, nodes: [node] }),
  ),
);

function traverse(
  cache: Cache<any, any>,
  inputValue: unknown,
  bricks: Brick[] = [],
  prefix: string = '',
): BuildResults {
  return pipe(
    inputValue,
    O.fromNullable,
    O.map(array),
    O.map(A.reduceWithIndex<unknown, BuildResults>({ dirty: false, nodes: [] }, (index, acc, value) => {
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
        O.map(({ dirty, nodes }) => {
          if (Array.isArray(nodes) && nodes.length) {
            acc.nodes?.push(...nodes);
            acc.dirty = acc.dirty || dirty;
          }
          return acc;
        }),
        O.getOrElseW(() => acc),
      );
    })),
    O.getOrElse<BuildResults>(() => ({ dirty: false, nodes: null })),
  );
}

export const useBricksBuilder = (
  value: unknown,
  bricks: Brick[],
): ReactNode => {
  const cache = useCache();

  return useMemo(
    () => traverse(cache, value, bricks, '').nodes,
    [cache, bricks, value],
  );
};
