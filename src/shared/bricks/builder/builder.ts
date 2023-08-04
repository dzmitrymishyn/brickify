import { capitalizeFirstLetter } from '@/shared/operators';
import { Spread } from '@/shared/utils';

import { Brick } from '../utils';

export function make<Component extends Brick, Parts extends object[]>(
  brick: Component,
  ...parts: Parts
) {
  const newBrick = brick.bind(null) as Brick;

  newBrick.displayName = capitalizeFirstLetter(brick?.brick || 'UnnamedBrick');

  return Object.assign(newBrick, brick, ...parts) as Component & Spread<Parts>;
}
