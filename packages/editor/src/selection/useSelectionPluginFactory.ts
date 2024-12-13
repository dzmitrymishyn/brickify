import { type AnyRange, restoreRange } from '@brickifyio/browser/selection';
import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { useMemo } from 'react';

import { useAfterRenderRangeRestore } from './useAfterRenderRangeRestore';

const token = Symbol('SelectionPlugin');

type SelectionRangeApplier = 'applyOnRender' | null;

const createController = () => {
  let range: AnyRange | null = null;
  let applier: SelectionRangeApplier = null;

  return {
    apply: () => {
      restoreRange(range);
    },
    storeRange: (
      newRange: AnyRange | null = null,
      newApplier: SelectionRangeApplier = null,
    ) => {
      range = newRange;
      applier = newApplier;
    },
    getRange: () => range,
    applyRangeIfActive: (neededApplier: NonNullable<SelectionRangeApplier>) => {
      if (neededApplier === applier) {
        restoreRange(range);
        applier = null;
      }
    },
  };
};

export type SelectionController = ReturnType<typeof createController>;

export const useSelectionPluginFactory: UsePluginFactory<
  { value: unknown },
  SelectionController
> = ({ value }) => {
  const controller = useMemo(createController, []);

  useAfterRenderRangeRestore(controller.applyRangeIfActive, value);

  return {
    controller,
    token,
  };
};

export const useSelectionController = createUsePlugin<SelectionController>(
  token,
);
