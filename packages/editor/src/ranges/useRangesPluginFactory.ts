import { createUsePlugin, type UsePluginFactory } from '@brickifyio/renderer';
import { useMemo } from 'react';

import { useAfterMutationRangeRestore } from './useAfterMutationRangeRestore';
import { type RangeKey, type RangesController, type RangeType } from './utils';

const token = Symbol('RangesPlugin');

export const useRangesPluginFactory: UsePluginFactory<
  { value: unknown },
  RangesController
> = ({ value }) => {
  const controller = useMemo(() => new Map<RangeKey, RangeType>(), []);

  useAfterMutationRangeRestore(controller, value);

  return {
    controller,
    token,
  };
};

export const useRangesController = createUsePlugin<RangesController>(token);
