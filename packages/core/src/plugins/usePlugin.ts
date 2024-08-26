import { type Plugin } from './plugins';
import { useBrickContextUnsafe } from '../hooks';

export const usePlugin = <T>(
  token: string | symbol,
  pluginsProp?: Record<string | symbol, Plugin>,
): T | undefined => {
  const context = useBrickContextUnsafe();

  return context?.plugins?.[token]?.controller as T | undefined
    ?? pluginsProp?.[token]?.controller as T | undefined;
};
