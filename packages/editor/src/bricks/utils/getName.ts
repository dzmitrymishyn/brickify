import { type NamedComponent } from '../brick';

export const getName = (Component: NamedComponent) => Component.displayName
  ?? Component.name;
