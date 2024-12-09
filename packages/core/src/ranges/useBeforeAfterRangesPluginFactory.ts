import {
  addRange,
  type CustomRange,
  fromCustomRange,
  getRange,
  getRangeCopy,
  type RangeCopy,
  toCustomRange,
} from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import {
  type MutableRefObject,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { fromPathRange } from './fromPathRange';
import { type PathRange } from './pathRange';
import { useRangeSaver } from './useRangeSaver';
import { createUsePlugin, type UsePluginFactory } from '../plugins';

const token = Symbol('BeforeAfterRangesPlugin');

const createController = (
  ref: RefObject<HTMLElement>,
  ranges: MutableRefObject<{
    before?: RangeCopy;
    after?: CustomRange | PathRange;
  }>,
) => ({
  saveBefore() {
    ranges.current.before = getRangeCopy();
  },
  getAfter() {
    return ranges.current.after;
  },
  clearBefore() {
    ranges.current.before = undefined;
  },
  saveAfter(range: PathRange | CustomRange | Range | null = getRange()) {
    if (range instanceof Range) {
      ranges.current.after = toCustomRange(ref.current!)(range);
    } else if (range) {
      ranges.current.after = range;
    }
  },
  getBefore() {
    return ranges.current.before;
  },
  clearAfter() {
    ranges.current.after = undefined;
  },
});

export type BeforeAfterRangesController = (
  ReturnType<typeof createController>
);

export const useBeforeAfterRangesPluginFactory: UsePluginFactory<
  { value: unknown },
  BeforeAfterRangesController
> = ({ value }, deps) => {
  const ref = useRef<HTMLElement>(null);
  const ranges = useRef<{
    before?: RangeCopy;
    after?: CustomRange | PathRange;
  }>({
    before: undefined,
    after: undefined,
  });

  const controller = useMemo(() => createController(
    ref,
    ranges,
  ), []);

  useRangeSaver(controller, ref);

  useEffect(function restoreRange() {
    const range = controller.getAfter();

    if (!range) {
      return;
    }

    if ('container' in range) {
      pipe(range, fromCustomRange, addRange);
    } else {
      pipe(fromPathRange(range, value, deps.store), addRange);
    }
  }, [controller, value, deps.store]);

  return {
    ref,
    controller,
    token,
  };
};

export const useBeforeAfterRanges = createUsePlugin<
  BeforeAfterRangesController
>(token);
