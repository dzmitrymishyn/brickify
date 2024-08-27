import { type Plugin } from './plugins';
import { usePlugin, usePluginUnsafe } from './usePlugin';

export const createUsePluginUnsafe = <R>(token: string | symbol) =>
  (pluginsProp?: Record<string | symbol, Plugin>) =>
    usePluginUnsafe<R>(token, pluginsProp);

export const createUsePlugin = <R>(token: string | symbol) =>
  (pluginsProp?: Record<string | symbol, Plugin>) =>
    usePlugin<R>(token, pluginsProp);
