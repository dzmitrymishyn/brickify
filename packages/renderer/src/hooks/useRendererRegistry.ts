import { useEffect, useRef } from 'react';

import { useRendererContext } from '../context';
import { type RendererStoreValue } from '../store';
import assert from 'assert';

/**
 * Registers DOM node to a store and controls the storage cleanup on component
 * unmount.
 * @returns ref function that should be set to a root DOM node
 */
export const useRendererRegistry = (
  stored?: RendererStoreValue<object>,
) => {
  assert(stored, 'stored value must be specified');

  const { store } = useRendererContext();

  const storedBrickRef = useRef<object>();

  // If we get a new value that doesn't match the old one we need to clear
  // the store from the old value
  if (stored.value !== storedBrickRef.current) {
    const oldBrick = storedBrickRef.current || {};
    const oldStored = store.get(oldBrick);
    const newStored = {
      ...oldStored,
      ...stored,
    };

    store.delete(oldBrick);
    store.set(newStored.value, newStored);

    if (newStored.domNode) {
      store.set(newStored.domNode, newStored);
    }
  }

  storedBrickRef.current = stored.value;

  const ref = (node?: Node | null) => {
    if (!node || !storedBrickRef.current) {
      return;
    }

    const item = store.get<object>(storedBrickRef.current);

    assert(item, 'item should be defined');

    const newBrick: RendererStoreValue<object> = {
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
      const value = storedBrickRef.current;

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
