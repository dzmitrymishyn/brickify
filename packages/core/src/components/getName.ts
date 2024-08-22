import { type Component, type NamedComponent } from './brick';

export const getName = (inputComponent: Component) => {
  const component = inputComponent as NamedComponent;
  return component.brick
    ?? component.displayName
    ?? component.name;
};
