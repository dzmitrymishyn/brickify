import { extend } from './extend';
import { hasProps, withProps } from './withProps';
import {
  type Component as ComponentType,
  getName,
} from '../components';

export type SlotValue =
  | 'inherit'
  | ('inherit' | ComponentType | [string, ComponentType?, object?] | [string, string, ComponentType?, object?])[];

export type Slot = [string, SlotValue];
export type Slots = Record<Slot[0], SlotValue>;

type WithSlots = {
  slots: Record<string, SlotValue>;
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
    [key]: components,
  }), {}),
});

export const applySlots = (
  slots: SlotValue,
  parentSlots: Record<string, ComponentType> = {},
) => {
  if (slots === 'inherit') {
    return parentSlots;
  }

  return Object.fromEntries(slots.flatMap((slot) => {
    if (slot === 'inherit') {
      return Object.entries(parentSlots);
    }

    if (Array.isArray(slot)) {
      const props = typeof slot[1] === 'string' ? slot[3] : slot[2];
      let Component = (
        typeof slot[1] === 'string'
          ? parentSlots[slot[1]] ?? slot[2]
          : parentSlots[slot[0]] ?? slot[1]
      ) ?? (() => null);

      if (hasProps(Component) && props) {
        Component = extend(Component, withProps({
          ...Component.props,
          ...props,
        }));
      }

      return [[
        slot[0],
        Component,
      ]];
    }

    return [[getName(slot), slot]];
  }));
};
