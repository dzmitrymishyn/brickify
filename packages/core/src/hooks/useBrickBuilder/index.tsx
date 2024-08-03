import { type Node } from '@brickifyio/utils/slots-tree';
import {
  type ReactNode,
  useMemo,
  useRef,
} from 'react';

import { objectToReact } from './objectToReact';
import { type OnChange } from '../../changes';
import { bricksToMap, type Component } from '../../components';
import { useBrickContext } from '../useBrickContext';
import assert from 'assert';

export const useBricksBuilder = (
  brick: object,
  value: object,
  bricks: Component[],
  onChange: OnChange,
): ReactNode => {
  const { store } = useBrickContext();
  const rootValueRef = useRef<Node | undefined>(undefined);

  const element = useMemo(() => {
    const storedItem = store.get(brick);

    assert(storedItem, 'brick item should be stored in the store');

    const parent = storedItem.slotsTreeNode;
    const oldParent = rootValueRef.current;
    parent.slots = {};
    rootValueRef.current = { ...parent };
    const pathRef = store.get(brick)!.pathRef;
    const parentPathRef = {
      current: () => [
        ...pathRef.current() ?? [],
        'value',
      ],
    };

    return objectToReact(value)({
      onChange,
      slots: bricksToMap(bricks) as Record<string, Component>,
      parentPathRef,
      parent,
      oldParent,
      store,
    });
  }, [brick, bricks, value, onChange, store]);

  return element;
};
