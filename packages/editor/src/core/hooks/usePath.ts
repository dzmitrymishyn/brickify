import { useBrickContext } from './useBrickContext';
import assert from 'assert';

export const usePath = (value: object) => {
  const { store } = useBrickContext();

  const storedItem = store.get(value);

  assert(
    storedItem,
    'We cannot find stored item. It means that the editor works incorrect',
  );

  return storedItem.pathRef;
};
