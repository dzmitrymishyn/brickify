import { loopUntil } from '@/shared/operators';

export const getLastDeepLeaf = loopUntil<Node>(
  (current) => !current.lastChild,
  (current) => current.lastChild,
);
