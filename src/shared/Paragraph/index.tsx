'use client';

import { parseDocument } from 'htmlparser2';
import React, {
  ElementType,
  forwardRef,
  ReactNode,
  RefObject,
  useMemo,
  useRef,
} from 'react';

import {
  Brick,
} from '@/shared/bricks/brick';

import { domToReactFactory } from './domToReactFactory';
import useMergedRefs from '../Editor/useMergedRef';
import { useMutation } from '../Editor/useMutation';

type Component = {
  bricks: Brick[];
  component: ElementType;
};

type Props = Partial<Component> & {
  children: string | number;
  // TODO: Create default BrickProps
  brickValue?: any;
};

const Paragraph = forwardRef<HTMLElement, Props>(({
  children,
  bricks = [],
  component: Component = 'div',
  brickValue,
}, refProp) => {
  const oldComponents = useRef<ReactNode>();

  const domToReact = useMemo(() => domToReactFactory(
    bricks,
    oldComponents,
  ), [bricks]);
  const components = useMemo(
    () => domToReact(parseDocument(`${children}`), 0),
    [children, domToReact],
  );

  const mutationRef: RefObject<HTMLElement> = useMutation({
    characterData: () => ({
      ...brickValue,
      children: mutationRef.current?.innerHTML ?? '',
    }),
  });

  const ref = useMergedRefs(mutationRef, refProp);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  oldComponents.current = <>{components}</>;

  return (
    <Component data-brick="paragraph" ref={ref}>
      {components}
    </Component>
  );
});

Paragraph.displayName = 'Paragraph';

export default Paragraph;
