'use client';

import { useMemo } from 'react';

import {
  addCustomChildren,
  Brick,
  component,
  make,
  slots,
  useBricksBuilder,
} from '@/shared/bricks';

type Props = {
  value: unknown;
  bricks?: Brick[];
};

function of<Name extends string>(name: Name, inputBricks: Brick[] = []) {
  return make(
    component(
      name,
      ({ value, bricks: bricksArray }: Props) => {
        const Component = useMemo(() => addCustomChildren(
          of(name, bricksArray ?? inputBricks),
        ), [bricksArray]);
        const components = useBricksBuilder(value, Component);

        return (
          <div data-brick={name}>{components}</div>
        );
      },
    ),
    slots(['children', inputBricks]),
  );
}

export default of('editor');
