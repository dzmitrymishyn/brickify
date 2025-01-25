import { type AnyRange, restoreRange } from '@brickifyio/browser/selection';
import { createUsePlugin, type Plugin } from '@brickifyio/renderer';
import { useCallback, useRef } from 'react';

import { useAfterRenderRangeRestore } from './useAfterRenderRangeRestore';

const token = Symbol('SelectionPlugin');

type SelectionRangeApplier = 'applyOnRender' | null;

export const useSelectionPluginFactory = ({ value }: { value: unknown }) => {
  const rangeRef = useRef<AnyRange | null>(null);
  const applierRef = useRef<SelectionRangeApplier>(null);

  const apply = useCallback(() => {
    restoreRange(rangeRef.current);
  }, []);
  const storeRange = useCallback((
    newRange: AnyRange | null = null,
    newApplier: SelectionRangeApplier = null,
  ) => {
    rangeRef.current = newRange;
    applierRef.current = newApplier;
  }, []);
  const getRange = useCallback(() => rangeRef.current, []);
  const applyRangeIfActive = useCallback(
    (neededApplier: NonNullable<SelectionRangeApplier>) => {
      if (neededApplier === applierRef.current) {
        restoreRange(rangeRef.current);
        applierRef.current = null;
      }
    },
    [],
  );

  useAfterRenderRangeRestore(applyRangeIfActive, value);

  return {
    token,
    apply,
    storeRange,
    getRange,
    applyRangeIfActive,
  };
};

export type SelectionPlugin = Plugin<typeof useSelectionPluginFactory>;

export const useSelectionPlugin = createUsePlugin<SelectionPlugin>(token);
