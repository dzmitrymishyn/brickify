import { type Plugin } from '../plugins';
import { type BrickStore } from '../store';

export type BrickContextType = {
  editable: boolean;
  store: BrickStore;

  plugins: Record<string | symbol, Plugin>;
};
