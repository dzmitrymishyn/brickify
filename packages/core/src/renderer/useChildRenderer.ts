import { type ReactElement, type ReactNode } from 'react';

import { type BrickStoreValue } from '../store';
import { ObjectValue, useChildrenRenderer } from './useChildrenRenderer';

export const useChildRenderer = <Value = unknown>(
  parentBrick: BrickStoreValue<object>,
  slotName: string,
  slotValue: Value,
  make: ((brick: BrickStoreValue<ObjectValue<Value>>) => ReactElement),
): ReactNode => {
  return useChildrenRenderer(
    parentBrick,
    null,
    { [slotName]: slotValue },
    make,
  )?.[0] || null;
};
