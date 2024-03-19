import { Brick } from '../brick';

export const bricksToMap = (bricks: Brick[] | 'inherit'): 'inherit' | Record<string, Brick> => (
  bricks === 'inherit'
    ? bricks
    : bricks.reduce((slotAcc, brick) => ({
      ...slotAcc,
      [brick.displayName!]: brick,
    }), {})
);
