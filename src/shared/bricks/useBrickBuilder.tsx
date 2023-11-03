import {
  ReactElement,
  ReactNode,
  useMemo,
  useRef,
} from 'react';

import { bricksToReact } from './bricksToReact';
import { hasSlots } from './builder';
import { Brick } from './utils';

export const useBricksBuilder = (
  value: unknown,
  parentBrick: Brick,
): ReactNode => {
  const cacheRef = useRef<WeakMap<object, ReactElement>>(new WeakMap());

  const element = useMemo(() => bricksToReact(cacheRef.current, {
    Component: parentBrick,
    slot: ['children', hasSlots(parentBrick) ? parentBrick.slots.children : {}],
  })(value), [parentBrick, value]);

  return element;
};
