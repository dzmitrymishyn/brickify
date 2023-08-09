import { pipe } from 'fp-ts/lib/function';

import { tap } from '@/shared/operators';

import { splitBoundaryText } from './text';

export const prepareRange = (range: Range) => pipe(
  range.cloneRange(),
  tap(splitBoundaryText),
);
