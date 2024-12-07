import { createRef, type RefObject } from 'react';

export const makeRef = <Value>(value: Value) => {
  const ref = createRef<Value>();

  ref.current = value;

  return ref as RefObject<Value>;
};
