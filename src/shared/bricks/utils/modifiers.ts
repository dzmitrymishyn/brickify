import { BrickComponent, BrickCustomChildren } from './bricks';
import { BrickValue } from './values';

export const addCustomChildren = <B extends BrickComponent<any>, T>(
  brick: B,
  ...handlers: ((value: unknown) => null | BrickValue)[]
): B & BrickCustomChildren<T> => {
  const newBrick = (brick as Function).bind(null);

  return Object.assign(newBrick, {
    ...(brick as object),
    customChildren: handlers,
  });
};
