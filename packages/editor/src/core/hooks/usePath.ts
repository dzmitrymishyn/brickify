import { useBrickContext } from './useBrickContext';

export const usePath = (value: object) => {
  const { cache } = useBrickContext();
  const cacheItem = cache.get(value);

  return cacheItem?.pathRef || ({ current: () => [] });
};
