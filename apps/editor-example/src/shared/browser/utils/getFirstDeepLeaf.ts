import { loopUntil } from '@brickify/operators';

export const getFirstDeepLeaf = loopUntil<Node>(
  (current) => !current.firstChild,
  (current) => current.firstChild,
);
