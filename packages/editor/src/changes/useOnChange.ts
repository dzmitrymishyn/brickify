import { type RendererStoreValue } from '@brickifyio/renderer';

import { type Change, type OnChange } from './models';

export const useOnChange = <Value>(
  brickRecord: RendererStoreValue<Value>,
  onChange?: OnChange<Value>,
) => (change: Partial<Change<Partial<Value>>>) =>
  onChange?.({
    path: brickRecord.pathRef.current(),
    type: 'update',
    ...change,
    value: {
      ...brickRecord.value,
      ...change?.value,
    },
  });
