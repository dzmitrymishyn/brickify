import { type Component } from './brick';
import { getName } from './getName';

export const bricksToMap = (
  bricks: Component[] | 'inherit',
): 'inherit' | Record<string, Component> => (
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
