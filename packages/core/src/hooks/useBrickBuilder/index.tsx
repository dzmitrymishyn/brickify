import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { objectToReact } from './objectToReact';
import { type OnChange } from '../../changes';
import { bricksToMap, type BrickValue, type Component, isBrickValue } from '../../components';
import { type BrickStoreValue } from '../../store';
import { useBrickContext } from '../useBrickContext';
import assert from 'assert';

export const useBricksBuilder = (
  brick: BrickStoreValue<BrickValue | BrickValue[]>,
  value: BrickValue[],
  bricks: Component[],
  onChangeProp: OnChange = () => undefined,
): ReactNode => {
  const { store } = useBrickContext();
  const rootValueRef = useRef<BrickValue[] | undefined>(undefined);

  const onChangePropRef = useRef(onChangeProp);
  onChangePropRef.current = onChangeProp;

  const element = useMemo(() => {
    const storedItem = store.get(brick.value);

    assert(storedItem, 'brick item should be stored in the store');

    const pathRef = isBrickValue(brick) ? {
      current: () => [...storedItem.pathRef.current(), 'value'],
    } : storedItem.pathRef;
    const oldValue = rootValueRef.current;

    rootValueRef.current = value;

    return objectToReact(value)({
      onChange: onChangePropRef.current,
      slots: bricksToMap(bricks) as Record<string, Component>,
      pathRef,
      oldValue,
      store,
    });
  }, [brick, bricks, value, store]);

  return element;
};
