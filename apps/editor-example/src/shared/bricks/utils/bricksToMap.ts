import { NamedComponent } from '../brick';

export const bricksToMap = (bricks: NamedComponent[] | 'inherit'): 'inherit' | Record<string, NamedComponent> => (
  bricks === 'inherit'
    ? bricks
    : bricks.reduce((slotAcc, brick) => ({
      ...slotAcc,
      [brick.displayName!]: brick,
    }), {})
);
