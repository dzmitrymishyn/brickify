import { reduce } from '@brickifyio/operators';
import { pipe } from 'fp-ts/lib/function';

export const createPath = (start: Node, container?: Node | null) => pipe(
  start,
  reduce([] as (Node | null)[], (acc, current) => [
    [...acc, current],
    current.parentNode === container || current === container ? null : current.parentNode,
  ]),
  (arr) => arr.reverse(),
);
