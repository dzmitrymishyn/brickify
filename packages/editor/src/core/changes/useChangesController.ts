import { useCallback, useMemo, useRef } from 'react';

import { type ChangeState } from './models';
import { type Logger } from '../logger';

type Subscriber = {
  before?: () => void;
  apply?: () => void;
};

type UseChangesControllerOptions = {
  logger?: Logger;
};

export const useChangesController = ({
  logger,
}: UseChangesControllerOptions) => {
  const state = useRef<ChangeState>('interaction');

  const subscribersRef = useRef(
    new Map<HTMLElement, Subscriber>(),
  );

  const endBatch = useCallback(() => {
    state.current = 'interaction';
  }, []);

  return useMemo(() => ({
    state: () => state.current,
    startBatch: () => {
      state.current = 'batch';
      subscribersRef.current.forEach(({ before }) => before?.());
    },
    applyBatch: () => {
      subscribersRef.current.forEach(({ apply }) => {
        try {
          apply?.();
        } catch (error) {
          logger?.error('After batch apply operation has an error', error);
        }
      });

      endBatch();
    },
    endBatch,
    subscribeBatch: (element: HTMLElement, subscriber: Subscriber) => {
      subscribersRef.current.set(element, subscriber);
      return () => {
        subscribersRef.current.delete(element);
      };
    },
  }), [logger, endBatch]);
};

export type ChangesController = ReturnType<typeof useChangesController>;
