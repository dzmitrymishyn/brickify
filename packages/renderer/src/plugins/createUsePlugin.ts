import { type PluginContext } from './plugins';
import {
  usePlugin,
  usePluginUnsafe,
} from './usePlugin';

export const createUsePluginUnsafe = <R>(token: string | symbol) =>
  (pluginsProp?: Record<string | symbol, PluginContext>) =>
    usePluginUnsafe<Omit<R, 'root' | 'token'>>(token, pluginsProp);

export const createUsePlugin = <R>(token: string | symbol) => (
  pluginsProp?: Record<string | symbol, PluginContext>,
) => usePlugin<Omit<R, 'root' | 'token'>>(token, pluginsProp);
