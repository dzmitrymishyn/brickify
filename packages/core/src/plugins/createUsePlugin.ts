import { type Plugin } from './plugins';
import { usePlugin } from './usePlugin';

export const createUsePlugin = <R>(token: string | symbol) =>
  (pluginsProp?: Record<string | symbol, Plugin>) =>
    usePlugin<R>(token, pluginsProp);
