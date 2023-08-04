import { Brick, isBrick } from '../utils';

export type Slot = [string, Record<string, Brick>?];

export type BrickWithSlots = {
  slots: Record<Slot[0], Slot[1]>;
};

export const addSlots = <Slots extends Record<string, Brick[] | 'inherit'>>(
  slots: Slots,
) => ({
    slots: Object.entries(slots).reduce((acc, [key, bricks]) => ({
      ...acc,
      [key]: bricks === 'inherit'
        ? undefined
        : bricks.reduce((brickAcc, brick) => ({ ...brickAcc, [brick.brick]: brick }), {}),
    }), {}) as {
      [K in keyof Slots]: Slots[K] extends 'inherit'
        ? undefined
        : Record<string, Brick>
    },
  });

export const hasSlots = (brick: unknown): brick is Brick & BrickWithSlots =>
  isBrick(brick) && 'slots' in brick && !!brick.slots && typeof brick.slots === 'object';
