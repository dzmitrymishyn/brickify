'use client';

import { parseDocument } from 'htmlparser2';
import {
  ElementType,
  ReactNode,
  useMemo,
  useRef,
} from 'react';

import {
  addFactory,
  Brick,
  component,
  make,
} from '@/shared/bricks';

import { domToReactFactory } from './domToReactFactory';

type Props = {
  children: string | number;
  bricks?: Brick[],
};

function of<Name extends string>(
  name: Name,
  Component: ElementType = 'div',
  initialBricks: Brick[] = [],
) {
  return make(
    component(
      name,
      ({ children, bricks }: Props) => {
        const oldComponents = useRef<ReactNode>();

        const domToReact = useMemo(() => domToReactFactory(
          bricks || initialBricks,
          oldComponents,
        ), [bricks]);
        const components = useMemo(
          () => domToReact(parseDocument(`${children}`), 0),
          [children, domToReact],
        );

        // eslint-disable-next-line react/jsx-no-useless-fragment
        oldComponents.current = <>{components}</>;

        return (
          <Component data-brick={name}>{components}</Component>
        );
      },
    ),
    addFactory(of),
  );
}

export default of('paragraph');
