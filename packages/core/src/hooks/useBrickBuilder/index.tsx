import {
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { objectToReact } from './objectToReact';
import { type OnChange } from '../../changes';
import { bricksToMap, type BrickValue, type Component, isBrickValue } from '../../components';
import { useBrickContext } from '../useBrickContext';
import assert from 'assert';

export const useBricksBuilder = (
  brick: object,
  value: BrickValue[],
  bricks: Component[],
  onChange: OnChange = () => undefined,
): ReactNode => {
  const { store } = useBrickContext();
  const rootValueRef = useRef<BrickValue[] | undefined>(undefined);

  const element = useMemo(() => {
    const storedItem = store.get(brick);

    assert(storedItem, 'brick item should be stored in the store');

    const pathRef = isBrickValue(brick) ? {
      current: () => [...storedItem.pathRef.current(), 'value'],
    } : storedItem.pathRef;
    const oldValue = rootValueRef.current;

    rootValueRef.current = value;

    return objectToReact(value)({
      onChange,
      slots: bricksToMap(bricks) as Record<string, Component>,
      pathRef,
      oldValue,
      store,
    });
  }, [brick, bricks, value, onChange, store]);

  return element;
};
