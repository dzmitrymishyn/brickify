'use client';

import { useMemo } from 'react';

import {
  Brick,
  component,
  formatBricksArray,
  make,
  useBricksBuilder,
} from '@/shared/bricks';

type Props = {
  value: unknown;
  bricks?: Brick[];
};

function of<Name extends string>(name: Name) {
  return make(
    component(
      name,
      ({ value, bricks: bricksArray = [] }: Props) => {
        const bricks = useMemo(() => formatBricksArray(bricksArray), [bricksArray]);
        const components = useBricksBuilder(value, bricks);

        return (
          <div data-brick={name}>{components}</div>
        );
      },
    ),
  );
}

export default of('editor');
