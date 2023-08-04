import { Spread } from '@/shared/utils';

import { Brick } from '../utils';

export const make = <Component extends Brick, Parts extends object[]>(
  brick: Component,
  ...parts: Parts
) => Object.assign(
    brick.bind(null),
    brick,
    ...parts,
  ) as Component & Spread<Parts>;
