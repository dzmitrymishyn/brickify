import { useCallback, useEffect, useRef, useState } from 'react';

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
  {
    onChange,
  }: Partial<Pick<BrickStoreValue, 'onChange'>> = {},
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
    const oldStoredValue = store.get(valueRef.current);
    const storedValue = store.get(value);

    store.remove(valueRef.current);

    store.update(value, {
      ...oldStoredValue,
      ...storedValue,
    });
  }

  valueRef.current = value;

  const ref = (node?: Node | null) => {
    if (!node || !valueRef.current) {
      return;
    }

    const item = store.get(valueRef.current) || storedBrickValue.current;

    assert(item, 'item should be defined');

    store.update(item.value, { domNode: node, onChange });
  };

  useEffect(function destroyStoreItemOnUnmount() {
    if (storedBrickValue.current) {
      store.set(storedBrickValue.current.value, storedBrickValue.current);

      if (storedBrickValue.current.domNode) {
        store.set(storedBrickValue.current.domNode, storedBrickValue.current);
      }
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
  }, [store]);

  const useBrickChildRegistry = useCallback(
    (slotName: string, slotValue: object): object => {
      const { slotsTreeNode, pathRef } = store.get(value)!;

      // clearSlot(slotsTreeNode, slotName);

      const childPathRef = {
        current: () => [...pathRef.current(), slotName, '0'],
      };
      // const node = of(slotValue);

      // addArray(slotsTreeNode, slotName, node);

      store.set(slotValue, {
        value: slotValue,
        slotsTreeNode: slotValue,
        slotsTreeParent: slotsTreeNode,
        pathRef: childPathRef,
      });

      return slotValue;
    },
    [value, store],
  );

  const useBrickChildrenRegistry = useCallback(
    <T = unknown>(slotName: string | null, slotValues: T[]): (T extends object ? T : { value: T })[] => {
      type TT = T extends object ? T : { value: T };
      const { slotsTreeNode, pathRef } = store.get(value)!;
      // eslint-disable-next-line react-hooks/rules-of-hooks -- it's ok
      const [values, setValues] = useState<TT[]>([]);
      // eslint-disable-next-line react-hooks/rules-of-hooks -- it's ok
      const previousSlotValues = useRef<T[]>([]);

      if (previousSlotValues.current !== slotValues) {
        setValues(Array.from(
          { length: Math.max(previousSlotValues.current.length, slotValues.length) },
          (_, index) => {
            const newValue = slotValues[index] === previousSlotValues.current[index]
              ? values[index]
              : (
                typeof slotValues[index] === 'object'
                  ? slotValues[index]
                  : { value: slotValues[index] }
              ) as TT;

            if (store.get(newValue)) {
              return newValue;
            }

            // const node = of(newValue);
            const childPathRef = {
              current: () => [...pathRef.current(), ...(slotName ? [slotName] : []), `${index}`],
            };

            // addArray(slotsTreeNode, slotName || `${index}`, node);

            store.set(newValue, {
              value: newValue,
              slotsTreeNode: newValue,
              slotsTreeParent: slotsTreeNode,
              pathRef: childPathRef,
            });

            return newValue;
          },
        ));

        previousSlotValues.current = slotValues;
      }

      return values;
    },
    [value, store],
  );

  return { ref, useBrickChildRegistry, useBrickChildrenRegistry };
};
