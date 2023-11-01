import { loopUntil } from '@/shared/operators';

export const getFirstDeepLeaf = loopUntil<Node>(
  (current) => !current.firstChild,
  (current) => current.firstChild,
);
