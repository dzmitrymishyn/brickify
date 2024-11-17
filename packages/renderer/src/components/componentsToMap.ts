import { type Component } from './component';
import { getName } from './getName';

export const componentsToMap = (
  components?: Component[],
): Record<string, Component> => Object.fromEntries(
  components?.map((component) => [
    getName(component),
    component,
  ]) ?? [],
);

