import { Brick } from '../brick';

export const getName = (Component: Brick) => Component.displayName || Component.name;
