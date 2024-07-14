import { type NamedComponent } from './brick';

export const getName = (Component: NamedComponent) =>
  Component.brick
  ?? Component.displayName
  ?? Component.name;
