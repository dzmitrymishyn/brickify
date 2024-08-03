import { type NamedComponent } from './brick';
import { getName } from './getName';

export const bricksToMap = (
  bricks: NamedComponent[] | 'inherit',
): 'inherit' | Record<string, NamedComponent> => (
  bricks === 'inherit'
    ? bricks
    : bricks.reduce((slotAcc, brick) => ({
      ...slotAcc,
      // TODO: Check this place
      [getName(brick) ?? '']: brick,
    }), {})
);
