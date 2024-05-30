import { loopUntil } from '@brickifyio/operators';

export const getLastDeepLeaf = loopUntil<Node>(
  (current) => !current.lastChild,
  (current) => current.lastChild,
);
