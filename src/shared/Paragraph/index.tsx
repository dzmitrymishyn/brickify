'use client';

import { ElementType } from 'react';

import { addFactory, component, make } from '@/shared/bricks';

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
      ({ children }: Props) => (
        <Component data-brick={name}>{children}</Component>
      ),
    ),
    addFactory(of),
  );
}

export default of('paragraph');
