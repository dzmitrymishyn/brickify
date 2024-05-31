import { type NamedComponent } from '../brick';

export const bricksToMap = (bricks: NamedComponent[] | 'inherit'): 'inherit' | Record<string, NamedComponent> => (
  bricks === 'inherit'
    ? bricks
    : bricks.reduce((slotAcc, brick) => ({
      ...slotAcc,
      // TODO: Check this place
      [brick.displayName ?? '']: brick,
    }), {})
);
