'use client';

import { ElementType } from 'react';

import { addCustomChildren, Brick, childBricks, component, factory, make } from '@/shared/bricks';
import Text from '@/shared/components/Text';

type Props = {
  children: string | number;
};

function of<Name extends string>(
  name: Name,
  Component: ElementType = 'div',
  bricks: Brick[] = [Text],
) {
  return make(
    component(
      name,
      ({ children }: Props) => {
        return (
          <Component data-brick={name}>{children}</Component>
        );
      },
    ),
    childBricks(bricks),
    factory(of),
  );
}

export default addCustomChildren(
  of('paragraph'),
  (value: string) => typeof value === 'string',
);
