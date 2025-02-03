import { type AnyRange, restoreRange } from '@brickifyio/browser/selection';
import { createUsePlugin, type Plugin } from '@brickifyio/renderer';
import { pipe } from 'fp-ts/lib/function';
import { useCallback, useRef } from 'react';

import { useAfterRenderRangeRestore } from './useAfterRenderRangeRestore';

const token = Symbol('SelectionPlugin');

type SelectionRangeApplier =
  | 'afterMutation'
  | 'beforeMutation';

type SelectionRangesMap = Partial<
  Record<SelectionRangeApplier | symbol, AnyRange | null>
>;

const defaultApplier = Symbol('default selection applier');

export const useSelectionPluginFactory = ({ value }: { value: unknown }) => {
  const appliersRangeRef = useRef<SelectionRangesMap>({});

  const storeRange = useCallback((
    range: AnyRange | null = null,
    applier?: SelectionRangeApplier,
  ) => {
    appliersRangeRef.current[applier ?? defaultApplier] = range;
  }, []);
  const getRange = useCallback(
    (applier?: SelectionRangeApplier) =>
      appliersRangeRef.current[applier ?? defaultApplier],
    [],
  );
  const apply = useCallback((applier?: SelectionRangeApplier) => pipe(
    getRange(applier),
    restoreRange,
    () => {
      appliersRangeRef.current[applier ?? defaultApplier] = undefined;
    },
  ), [getRange]);

  useAfterRenderRangeRestore(apply, value);

  return {
    token,
    apply,
    storeRange,
    getRange,
  };
};

export type SelectionPlugin = Plugin<typeof useSelectionPluginFactory>;

export const useSelectionPlugin = createUsePlugin<SelectionPlugin>(token);
