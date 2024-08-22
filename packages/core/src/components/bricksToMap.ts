import { type Component, type NamedComponent } from './brick';
import { getName } from './getName';

export const bricksToMap = (
  bricks: NamedComponent[] | 'inherit',
): 'inherit' | Record<string, NamedComponent> => (
  bricks === 'inherit'
    ? bricks
    : bricks.reduce((slotAcc, brick) => ({
      ...slotAcc,
      [getName(brick) ?? '']: brick,
    }), {})
);

export const componentsToMap = (
  components?: Component[],
): Record<string, Component> => (
  components?.reduce((slotAcc, component) => ({
    ...slotAcc,
    [getName(component) ?? '']: component,
  }), {}) ?? {}
);
