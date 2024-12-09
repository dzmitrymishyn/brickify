import { type AnyRange, getRange, restoreRange } from '@brickifyio/browser/selection';
import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { useMemo } from 'react';

import { useAfterMutationRangeRestore } from './useAfterMutationRangeRestore';
import { type RangeType } from './utils';

const token = Symbol('SelectionPlugin');

const createController = () => {
  const rangesStore: Partial<Record<RangeType, AnyRange>> = {};

  const clearRange = (type: RangeType) => {
    rangesStore[type] = undefined;
  };

  return {
    range: {
      restore: (type: RangeType) => {
        restoreRange(rangesStore[type]);
        clearRange(type);
      },
      clear: clearRange,
      save: (type: RangeType, range: AnyRange | null = getRange()) => {
        rangesStore[type] = range ?? undefined;
      },
    },
  };
};

export type SelectionController = ReturnType<typeof createController>;

export const useSelectionPluginFactory: UsePluginFactory<
  { value: unknown },
  SelectionController
> = ({ value }) => {
  const controller = useMemo(createController, []);

  useAfterMutationRangeRestore(controller.range.restore, value);

  return {
    controller,
    token,
  };
};

export const useSelectionController = createUsePlugin<SelectionController>(
  token,
);
