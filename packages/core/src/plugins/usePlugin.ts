import { type Plugin } from './plugins';
import { useBrickContextUnsafe } from '../hooks';
import assert from 'assert';

export const usePluginUnsafe = <T>(
  token: string | symbol,
  pluginsProp?: Record<string | symbol, Plugin>,
): T | undefined => {
  const context = useBrickContextUnsafe();

  return context?.plugins?.[token]?.controller as T | undefined
    ?? pluginsProp?.[token]?.controller as T | undefined;
}

export const usePlugin = <T>(
  token: string | symbol,
  pluginsProp?: Record<string | symbol, Plugin>,
): T => {
  const controller = usePluginUnsafe<T>(token, pluginsProp);

  assert(controller, `${token.toString()} plugin must be registered`);

  return controller;
};
