import {
  type CustomRange,
  type RangeCopy,
} from '@brickifyio/browser/selection';

export const AFTER_CHANGE = Symbol('Reset selection after value change');

export type RangeType = CustomRange | Range | RangeCopy;

export type RangeKey = string | symbol;

export type RangesController = Map<RangeKey, RangeType | undefined>;
