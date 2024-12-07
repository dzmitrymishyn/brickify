import { type RefObject, useRef } from 'react';

export const useSyncedRef = <Value>(value: Value): RefObject<Value> => {
  const ref = useRef<Value>(null);

  ref.current = value;

  return ref as RefObject<Value>;
};
