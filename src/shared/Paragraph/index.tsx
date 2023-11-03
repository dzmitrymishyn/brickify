'use client';

import { parseDocument } from 'htmlparser2';
import {
  ElementType,
  ReactNode,
  useMemo,
  useRef,
} from 'react';

import { addFactory, component, make } from '@/shared/bricks';
import Em from '@/shared/components/Em';
import Strong from '@/shared/components/Strong';

import { domToReactFactory } from './domToReactFactory';

type Props = {
  children: string | number;
};

function of<Name extends string>(
  name: Name,
  Component: ElementType = 'div',
) {
  return make(
    component(
      name,
      ({ children }: Props) => {
        const oldComponents = useRef<ReactNode>();

        const domToReact = useMemo(() => domToReactFactory([Strong, Em], oldComponents), []);
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
