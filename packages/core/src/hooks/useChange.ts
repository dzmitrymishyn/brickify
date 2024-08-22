import { type Change, type OnChange } from '../changes';
import { type BrickStoreValue } from '../store';

export const useChange = <Value>(
  brick: BrickStoreValue<Value>,
  onChange?: OnChange<Value>,
) => (value: Partial<Value>, type: Change['type'] = 'update') =>
  onChange?.({
    path: brick.pathRef.current(),
    type,
    value: {
      ...brick.value,
      ...value,
    },
  });
