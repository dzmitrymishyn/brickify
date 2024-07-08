import { useMemo, useRef } from 'react';

import { type ChangeState } from './models';

type Subscriber = {
  before?: () => void;
  apply?: () => void;
};

export const useChangesController = () => {
  const state = useRef<ChangeState>('interaction');

  const subscribersRef = useRef(
    new Map<HTMLElement, Subscriber>(),
  );

  return useMemo(() => ({
    state: () => state.current,
    startBatch: () => {
      state.current = 'batch';
      subscribersRef.current.forEach(({ before }) => before?.());
    },
    applyBatch: () => {
      subscribersRef.current.forEach(({ apply }) => apply?.());
      state.current = 'interaction';
    },
    subscribeBatch: (element: HTMLElement, subscriber: Subscriber) => {
      subscribersRef.current.set(element, subscriber);
      return () => {
        subscribersRef.current.delete(element);
      };
    },
  }), []);
};

export type ChangesController = ReturnType<typeof useChangesController>;
