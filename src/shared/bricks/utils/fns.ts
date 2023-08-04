import { Brick } from './bricks';

export const formatBricksArray = (bricks: Brick[] = []) => bricks.reduce((acc, brick) => ({
  ...acc,
  [brick.brick]: brick,
}), {});
