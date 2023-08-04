import { Brick, BrickValue, isBrick } from '../utils';

export type BrickCustomChildren<T> = {
  customChildren: ((value: T) => BrickValue)[];
};

export const addCustomChildren = (...handlers: ((value: unknown) => null | BrickValue)[]) => ({
  customChildren: handlers,
});

export const hasCustomChildren = (brick: unknown): brick is Brick & BrickCustomChildren<any> =>
  isBrick(brick)
  && 'customChildren' in brick
  && Array.isArray(brick.customChildren);
