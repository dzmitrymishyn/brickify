import { FC } from 'react';

import { BrickValue } from './values';

export type BrickName<Name = string> = {
  brick: Name;
};

export type BrickComponent<Component extends FC<any>> =
  & Component
  & {
    is(node: Node): boolean;
    parseValue(html: string): unknown;
  };

export type Brick<Name = string, Component extends FC<any> = FC<any>> =
  & BrickName<Name>
  & BrickComponent<Component>;

export type BrickFactory<Input, Output extends BrickName> = {
  of(...props: Input[]): Output;
};

export type BrickCustomChildren<T> = {
  customChildren: ((value: T) => BrickValue)[];
};

export type Slot = [string, Record<string, Brick>?];

export type BrickWithSlots = {
  slots: Record<Slot[0], Slot[1]>;
};

export const isBrick = (brick: unknown): brick is Brick =>
  !!brick
  && typeof brick === 'function'
  && 'brick' in brick
  && typeof brick.brick === 'string';

export const hasCustomChildren = (brick: unknown): brick is Brick & BrickCustomChildren<any> =>
  isBrick(brick)
  && 'customChildren' in brick
  && Array.isArray(brick.customChildren);

export const hasSlots = (brick: unknown): brick is Brick & BrickWithSlots =>
  isBrick(brick) && 'slots' in brick && !!brick.slots && typeof brick.slots === 'object';
