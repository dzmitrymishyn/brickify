import { bricksToMap } from './bricksToMap';
import { NamedComponent } from '../brick';

export type Slot = [string, 'inherit' | NamedComponent[]];
export type Slots = Record<Slot[0], Slot[1]>;

const addSlots = <S extends Slots>(slots: S) => ({
  slots: Object.entries(slots).reduce((acc, [key, bricks]) => ({
    ...acc,
    [key]: bricksToMap(bricks),
  }), {}),
});

export { addSlots as slots };

type WithSlots = {
  slots: Record<string, 'inherit' | Record<string, NamedComponent>>;
};

export const hasSlots = (Component: unknown): Component is WithSlots => !!(
  (typeof Component === 'function' || typeof Component === 'object')
  && Component
  && 'slots' in Component
  && typeof Component.slots === 'object'
  && Component.slots
);
