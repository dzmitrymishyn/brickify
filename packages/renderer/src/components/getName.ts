import { type Component, type NamedComponent } from './component';
import assert from 'assert';

export const getName = (inputComponent: Component) => {
  const component = inputComponent as NamedComponent;
  const name = component.brick
    ?? component.displayName
    ?? component.name;

  assert(name, 'Component should have name');

  return name;
};
