import { add, clearSlot, of } from '@brickifyio/utils/slots-tree';
import { useCallback, useEffect, useRef } from 'react';

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
  value?: object,
) => {
  assert(value, 'Value should be specified');

  const { store } = useBrickContext();

  /**
   * The variable is used only for the development purposes and will not be
   * used in the production build.
   * The `destroyStoreItemOnUnmount` clear the store from the variable and we
   * call it ones on unmount. But in StrictMode react call the useEffect
   * twice and we need to add the value again to the store
   */
  const storedBrickValue = useRef<BrickStoreValue>();
  const valueRef = useRef(value);

  // If we get a new value that doesn't match the old one we need to clear
  // the store from the old value
  if (valueRef.current && value !== valueRef.current) {
    store.remove(valueRef.current);
  }

  valueRef.current = value;

  const updateStore = useCallback((item?: BrickStoreValue) => {
    // If we don't have a value here it means that smth works not good and
    // we can't guarantee the right behavior
    assert(item, 'item should be registered in the store');

    if (item.domNode) {
      store.set(item.domNode, item);
    }

    store.set(item.value, item);
  }, [store]);

  const ref = (node?: Node | null) => {
    if (!node || !valueRef.current) {
      return;
    }

    const item = store.get(valueRef.current) || storedBrickValue.current;

    if (item?.domNode && item.domNode !== node) {
      store.remove(item.domNode);
      item.domNode = node ?? undefined;
    }

    updateStore(item);
  };

  useEffect(function destroyStoreItemOnUnmount() {
    if (storedBrickValue.current) {
      updateStore(storedBrickValue.current);
    }

    return () => {
      if (!valueRef.current) {
        return;
      }

      if (storedBrickValue.current) {
        // TODO: Remove it
        // eslint-disable-next-line no-console -- it's for development
        console.log('component was removed', valueRef.current);
      }

      const item = store.get(valueRef.current);
      storedBrickValue.current = item;

      if (item?.value) {
        store.remove(item.value);
      }

      if (item?.domNode) {
        store.remove(item.domNode);
      }
    };
  }, [store, updateStore]);

  const useBrickChildRegistry = useCallback(
    (slotName: string, slotValue: object): object => {
      const { slotsTreeNode, pathRef } = store.get(value)!;

      clearSlot(slotsTreeNode, slotName);

      const childPathRef = {
        current: () => [...pathRef.current(), slotName, '0'],
      };
      const node = of(slotValue);

      add(slotsTreeNode, slotName, node);

      store.set(slotValue, {
        value: slotValue,
        slotsTreeNode: node,
        slotsTreeParent: slotsTreeNode,
        pathRef: childPathRef,
      });

      return slotValue;
    },
    [value, store],
  );

  return { ref, useBrickChildRegistry };
};
