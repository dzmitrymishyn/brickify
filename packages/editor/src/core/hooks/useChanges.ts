import { useMemo, useRef } from 'react';

export const useChanges = () => {
  const changesRef = useRef<unknown[]>([]);

  return useMemo(() => ({
    add: (change: unknown) => {
      changesRef.current.push(change);
    },
    get: () => changesRef.current,
    clear: () => {
      changesRef.current = [];
    },
  }), []);
};

export type ChangesController = ReturnType<typeof useChanges>;
