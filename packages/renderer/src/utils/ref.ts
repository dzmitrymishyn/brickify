import { type MutableRefObject } from 'react';

export const makeRef = <Value>(
  value: Value
): MutableRefObject<Value> => ({
  current: value,
});
