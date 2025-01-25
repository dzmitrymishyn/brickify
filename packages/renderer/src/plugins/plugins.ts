import { type ReactElement, type RefObject } from 'react';

import { type RendererStore, type RendererStoreValue } from '../store';

export type PluginToken = string | symbol;

export type PluginMap = Record<PluginToken, PluginContext>;

export type PluginContext = {
  token: symbol;
  root?: { ref?: RefObject<Node | null>; props?: object };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
   * Props for the component could be any object.
   */
  render?: (element: ReactElement<any>) => ReactElement<object>;
};

export type PluginDependencies = {
  store: RendererStore;
  stored: RendererStoreValue;
  plugins: PluginMap;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- disable
 * lint for any object type.
 */
export type UsePluginFactory<P = any, R extends PluginContext = PluginContext> =
  (props: P, deps: PluginDependencies) => R;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- disable
 * lint for any object arguments.
 */
export type Plugin<Factory extends (...args: any[]) => object> =
  Omit<ReturnType<Factory>, 'token' | 'root'>;
