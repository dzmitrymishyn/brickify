import { useMemo } from 'react';

import { type PluginMap, type PluginToken } from './plugins';
import { useRendererContextUnsafe } from '../context';
import assert from 'assert';

const createLazyErrorProxy = (
  token: PluginToken,
  pluginsProp?: PluginMap,
) => {
  const errorMessage = `${token.toString()} plugin must be registered`;
  return new Proxy(
    {},
    {
      get(_, name) {
        const plugin = getPlugin<Record<string | symbol, unknown>>(
          token,
          pluginsProp,
        );

        if (plugin) {
          return plugin[name];
        }

        throw new Error(errorMessage);
      },
    },
  );
};

export const getPlugin = <T>(
  token: PluginToken,
  plugins?: PluginMap | undefined,
) => plugins?.[token] as T | undefined;

export const usePluginUnsafe = <T>(
  token: PluginToken,
  pluginsProp?: PluginMap,
): T | undefined => {
  const context = useRendererContextUnsafe();

  return getPlugin(token, pluginsProp) ?? getPlugin(token, context?.plugins);
};

export type UsePluginOptions = {
  allowLazyAccess?: boolean;
};

export const usePlugin = <T>(
  token: PluginToken,
  pluginsProp?: PluginMap,
): T => {
  const context = usePluginUnsafe<T>(token, pluginsProp);
  const proxyContext = useMemo(() => createLazyErrorProxy(
    token,
    pluginsProp,
  ), [token, pluginsProp]);

  if (!pluginsProp) {
    assert(context, `${token.toString()} plugin must be registered`);
    return context;
  }

  return context ?? proxyContext as T;
};
