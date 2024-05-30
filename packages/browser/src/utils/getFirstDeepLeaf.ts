import { loopUntil } from '@brickifyio/operators';

export const getFirstDeepLeaf = loopUntil<Node>(
  (current) => !current.firstChild,
  (current) => current.firstChild,
);
