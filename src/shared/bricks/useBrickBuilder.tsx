/* eslint-disable @typescript-eslint/no-unused-vars */
import * as A from 'fp-ts/lib/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import React, { ReactNode, useMemo } from 'react';

import { array } from '@/shared/operators';
import { Cache, useCache } from '@/shared/utils/cache';

import { Brick, BrickValue, isBrick, isBrickValue, isChildrenFitBrick } from './utils';

type BuildResults = {
  dirty: boolean;
  nodes: ReactNode[];
};

const generatedName = Symbol('generated');
const makeGeneratedBrick = (value: unknown) => ({ brick: generatedName, children: value });

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
        let dirty = true;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const children = build(
          cache,
          value.children,
          'allowedBricks' in Component
            ? Component.allowedBricks as Brick[]
            : [],
          uid,
        );
        let node: ReactNode;
        const { brick, ...props } = value;

        if (cached?.Component.brick === Component.brick) {
          if (value.brick === generatedName && value.children === cached.value.children) {
            node = cached.node;
            dirty = false;
          } else if (!children.dirty) {
            node = React.cloneElement(cached.node, props);
          } else {
            node = React.cloneElement(cached.node, { ...props, children: children.nodes });
          }
        }

        node = node || (
          <Component
            {...props}
            {...(children.nodes.length ? { children: children.nodes } : {})}
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

function build(
  cache: Cache<any, any>,
  inputValue: unknown,
  bricks: Brick[] = [],
  prefix: string = '',
): BuildResults {
  return pipe(
    inputValue,
    O.fromNullable,
    O.map(array),
    O.map(A.reduceWithIndex<unknown, BuildResults>({ dirty: false, nodes: [] }, (key, acc, value) => {
      const uid = `${prefix}-${key}`;

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
            acc.nodes.push(...nodes);
            acc.dirty = acc.dirty || dirty;
          }
          return acc;
        }),
        O.getOrElseW(() => acc),
      );
    })),
    O.getOrElse<BuildResults>(() => ({ dirty: false, nodes: [] })),
  );
}

export const useBricksBuilder = (
  value: unknown,
  bricks: Brick[],
): ReactNode => {
  const cache = useCache();

  return useMemo(() => build(cache, value, bricks, '').nodes, [cache, bricks, value]);
};
