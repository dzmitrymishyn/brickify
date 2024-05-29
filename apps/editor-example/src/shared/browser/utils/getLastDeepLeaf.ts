import { loopUntil } from '@brickify/operators';

export const getLastDeepLeaf = loopUntil<Node>(
  (current) => !current.lastChild,
  (current) => current.lastChild,
);
