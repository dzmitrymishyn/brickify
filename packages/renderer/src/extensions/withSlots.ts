import { componentsToMap, type Component as ComponentType } from '../components';

export type SlotValue = 'inherit' | ComponentType[];

export type Slot = [string, SlotValue];
export type Slots = Record<Slot[0], SlotValue>;

type WithSlots = {
  slots: Record<string, 'inherit' | Record<string, ComponentType>>;
};

export const hasSlots = (Component: unknown): Component is WithSlots => (
  (typeof Component === 'function' || typeof Component === 'object')
  && Component !== null
  && 'slots' in Component
  && typeof Component.slots === 'object'
  && Component.slots !== null
);

export const withSlots = <S extends Slots>(slots: S) => ({
  slots: Object.entries(slots).reduce((acc, [key, components]) => ({
    ...acc,
    [key]: components === 'inherit'
      ? components
      : componentsToMap(components),
  }), {}),
});
