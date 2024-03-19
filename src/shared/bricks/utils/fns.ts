import { Brick } from '../brick';

export const formatBricksArray = (bricks: Brick[] = []) => bricks.reduce((acc, brick) => ({
  ...acc,
  [brick.displayName || brick.name]: brick,
}), {});
