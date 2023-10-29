import { pipe } from 'fp-ts/lib/function';

import { reduce } from '@/shared/operators';

export const createPath = (start: Node, container: Node) => pipe(
  start,
  reduce([] as (Node | null)[], (acc, current) => [
    [...acc, current],
    current.parentNode === container ? null : current.parentNode,
  ]),
  (arr) => arr.reverse(),
);
