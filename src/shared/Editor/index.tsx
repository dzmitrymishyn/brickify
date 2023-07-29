'use client';

import {
  Brick,
  component,
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
      ({ value, bricks = [] }: Props) => {
        const components = useBricksBuilder(value, bricks);
        return (
          <div data-brick={name}>{components}</div>
        );
      },
    ),
  );
}

export default of('editor');
