import {
  type CustomRange,
  getRange,
  getRangeLike,
  type RangeLike,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import { useMemo, useRef } from 'react';

export const useBeforeAfterRanges = () => {
  const ref = useRef<HTMLElement>(null);
  const ranges = useRef<{ before?: RangeLike; after?: CustomRange }>({
    before: undefined,
    after: undefined,
  });

  const controller = useMemo(() => ({
    saveBefore() {
      ranges.current.before = getRangeLike();
    },
    getAfter() {
      return ranges.current.after;
    },
    clearBefore() {
      ranges.current.before = undefined;
    },
    saveAfter() {
      ranges.current.after = pipe(
        getRange(),
        toCustomRange(ref.current!),
      );
    },
    getBefore() {
      return ranges.current.before;
    },
    clearAfter() {
      ranges.current.after = undefined;
    },
  }), []);

  return [ref, controller] as const;
};

export type BeforeAfterRangesController = (
  ReturnType<typeof useBeforeAfterRanges>
)[1];
