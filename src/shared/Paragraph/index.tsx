'use client';

import { parseDocument } from 'htmlparser2';
import React, {
  ElementType,
  forwardRef,
  ReactNode,
  useMemo,
  useRef,
} from 'react';

import {
  Brick,
} from '@/shared/bricks/brick';

import { domToReactFactory } from './domToReactFactory';

type Component = {
  bricks: Brick[];
  component: ElementType;
};

type Props = Partial<Component> & {
  children: string | number;
};

const Paragraph = forwardRef<HTMLElement, Props>(({
  children,
  bricks = [],
  component: Component = 'div',
}, ref) => {
  const oldComponents = useRef<ReactNode>();

  const domToReact = useMemo(() => domToReactFactory(
    bricks,
    oldComponents,
  ), [bricks]);
  const components = useMemo(
    () => domToReact(parseDocument(`${children}`), 0),
    [children, domToReact],
  );

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
