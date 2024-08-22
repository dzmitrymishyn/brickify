import { useEffect, useRef } from 'react';

import { useBrickContext } from './useBrickContext';
import { type BrickStoreValue } from '../store';
import assert from 'assert';

/**
 * Registers DOM node to a store and controls the storage cleanup on component
 * unmount.
 * @param value - the brick that should be passed to a component
 * @returns ref function that should be set to a root component of a component
 */
export const useBrickRegistry = (
  brick?: BrickStoreValue<object>,
  {
    onChange,
  }: Partial<Pick<BrickStoreValue, 'onChange'>> = {},
) => {
  assert(brick, 'Value should be specified');

  const { store } = useBrickContext();

  const valueRef = useRef<object>();

  // If we get a new value that doesn't match the old one we need to clear
  // the store from the old value
  if (brick.value !== valueRef.current) {
    const oldValue = valueRef.current || {};
    const oldStoredValue = store.get(oldValue);
    const newBrick = {
      ...oldStoredValue,
      ...brick,
      onChange,
    };

    store.delete(oldValue);

    store.set(newBrick.value, newBrick);
    if (newBrick.domNode) {
      store.set(newBrick.domNode, newBrick);
    }
  }

  valueRef.current = brick.value;

  const ref = (node?: Node | null) => {
    if (!node || !valueRef.current) {
      return;
    }

    const item = store.get(valueRef.current);

    assert(item, 'item should be defined');

    const newBrick: BrickStoreValue<object> = {
      ...item,
      domNode: node,
    };

    store.set(newBrick.value, newBrick);
    store.set(node, newBrick);
  };

  const timer = useRef(0);

  useEffect(function destroyStoreItemOnUnmount() {
    if (timer.current) {
      cancelAnimationFrame(timer.current);
    }

    return () => {
      const value = valueRef.current;
      if (!value) {
        return;
      }

      timer.current = requestAnimationFrame(() => {
        const item = store.get<object>(value);

        assert(item, 'item should be defined');

        store.delete(item.value);

        if (item.domNode) {
          store.delete(item.domNode);
        }
      });
    };
  }, [store]);

  return ref;
};
