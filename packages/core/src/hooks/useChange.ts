import { type Change, type OnChange } from '../changes';
import { type BrickStoreValue } from '../store';

export const useChange = <Value>(
  brick: BrickStoreValue<Value>,
  onChange?: OnChange<Value>,
) => (change: Partial<Change<Partial<Value>>>) =>
  onChange?.({
    path: brick.pathRef.current(),
    type: 'update',
    ...change,
    value: {
      ...brick.value,
      ...change?.value,
    },
  });
