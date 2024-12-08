import { type ReactElement, type RefObject } from 'react';

import { type RendererStore, type RendererStoreValue } from '../store';

export type PluginToken = string | symbol;

export type PluginMap = Record<PluginToken, Plugin>;

export type Plugin<Controller = unknown> = {
  token: symbol;
  controller: Controller;
  ref?: RefObject<Node | null>;
  render?: (element: ReactElement) => ReactElement;
  props?: object | null;
};

export type PluginDependencies = {
  store: RendererStore;
  stored: RendererStoreValue;
  plugins: PluginMap;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- disable
 * lint for any object type.
 */
export type UsePluginFactory<P extends object = any, R extends object = any> =
  (props: P, deps: PluginDependencies) => Plugin<R>;
