import * as A from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { BrickComponent, BrickCustomChildren, hasCustomChildren } from './bricks';

export const addCustomChildren = <B extends BrickComponent<any>, T>(
  brick: B,
  ...matches: ((value: any) => boolean)[]
): B & BrickCustomChildren<T> => {
  const newBrick = (brick as Function).bind(null);

  return Object.assign(newBrick, {
    ...(brick as object),
    customChildren: matches,
  });
};


export const isChildrenFitBrick = (children: unknown) => flow(
  O.fromPredicate(hasCustomChildren),
  O.map(({ customChildren }) => customChildren),
  O.chain(A.findFirst((matcher) => typeof matcher === 'function' && matcher(children))),
  O.map(Boolean),
  O.getOrElseW(() => false),
);
