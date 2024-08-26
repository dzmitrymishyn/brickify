import { type ReactElement, type RefObject } from 'react';

import { type BrickStore, type BrickStoreValue } from '../store';

export type Plugin<Controller = unknown> = {
  ref?: RefObject<Node>;
  render?: (element: ReactElement) => ReactElement;
  props?: object | null;
  token: symbol;
  controller: Controller;
};

export type PluginDependencies = {
  brick: BrickStoreValue;
  store: BrickStore;
  plugins: Record<string | symbol, Plugin>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ok
export type UsePluginFactory<P = any, R = any> = (
  props: P,
  deps: PluginDependencies,
) => Plugin<R>;
