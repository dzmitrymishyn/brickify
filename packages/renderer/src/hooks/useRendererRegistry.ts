import { useActionableRef } from '@brickifyio/utils/hooks';
import { useEffect, useRef } from 'react';

import { useRendererContext } from '../context';
import { type RendererStoreValue } from '../store';
import assert from 'assert';

/**
 * Registers DOM node to a store and controls the storage cleanup on component
 * unmount.
 * @returns ref function that should be set to a root DOM node
 */
export const useRendererRegistry = <Element extends Node = Node>(
  brickRecord?: Pick<RendererStoreValue<object>, 'value'>
    & Partial<Omit<RendererStoreValue<object>, 'value'>>,
) => {
  assert(
    brickRecord,
    'To register brickRecord in the store it must be specified',
  );

  const { store } = useRendererContext();

  const brickRef = useRef<object>({});

  // If we get a new value that doesn't match the old one we need to clear
  // the store from the old value
  if (brickRecord.value !== brickRef.current) {
    const oldBrick = brickRef.current || {};
    const oldBrickRecord = store.get(oldBrick);
    const newBrickRecord = {
      ...oldBrickRecord,
      ...brickRecord,
    } as RendererStoreValue<object>;

    store.delete(oldBrick);
    store.set(newBrickRecord.value, newBrickRecord);

    if (newBrickRecord.domNode) {
      store.set(newBrickRecord.domNode, newBrickRecord);
    }
  }

  brickRef.current = brickRecord.value;

  const ref = useActionableRef<Element>((node) => {
    if (!node || !brickRef.current) {
      return;
    }

    const item = store.get<object>(brickRef.current);

    assert(
      item,
      'Cannot store dom node for a brick. '
        + 'Stored value should be specified before setting dom node.',
    );

    const newBrick: RendererStoreValue<object> = {
      ...item,
      domNode: node,
    };

    store.set(newBrick.value, newBrick);
    store.set(node, newBrick);
  });

  const timer = useRef(0);
  useEffect(function destroyStoreItemOnUnmount() {
    if (timer.current) {
      cancelAnimationFrame(timer.current);
    }

    return () => {
      const value = brickRef.current;

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
