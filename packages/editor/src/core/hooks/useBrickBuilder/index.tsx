import { of, type Node as SlotsTreeNode } from '@brickifyio/utils/slots-tree';
import {
  type ReactNode,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import { objectToReact } from './objectToReact';
import { type ChangeEvent } from '../../changes';
import { bricksToMap, type Component } from '../../components';
import { useBrickContext } from '../useBrickContext';

export const useBricksBuilder = (
  children: unknown,
  bricks: Component[],
  onChange: (...changes: ChangeEvent[]) => void,
): [ReactNode, RefObject<SlotsTreeNode | undefined>] => {
  const { pathRef, cache } = useBrickContext();
  const rootValueRef = useRef<SlotsTreeNode | undefined>(undefined);

  const element = useMemo(() => {
    const oldParent = rootValueRef.current;
    rootValueRef.current = of({ children }, pathRef.current());

    return objectToReact(children)({
      onChange,
      cache,
      slots: bricksToMap(bricks) as Record<string, Component>,
      parentPathRef: pathRef,
      parent: rootValueRef.current,
      oldParent,
    });
  }, [bricks, children, onChange, pathRef, cache]);

  return [element, rootValueRef];
};
