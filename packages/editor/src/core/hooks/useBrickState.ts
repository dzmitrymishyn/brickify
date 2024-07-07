import { useMemo, useRef } from 'react';

export type ChangeState = 'browser' | 'interaction';

export const useBrickState = (editable: boolean) => {
  const changesStateRef = useRef<ChangeState>('interaction');

  return useMemo(() => ({
    get: () => ({
      editable,
      changes: changesStateRef.current,
    }),
    updateChangesState: (changeState: ChangeState) => {
      changesStateRef.current = changeState;
    },
  }), [editable]);
};

export type BrickState = ReturnType<typeof useBrickState>;
