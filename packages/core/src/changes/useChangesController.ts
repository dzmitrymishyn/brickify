import { useCallback, useMemo, useRef } from 'react';

import { type ChangeState } from './models';

type Subscriber = {
  before?: () => void;
  apply?: () => void;
};

export const useChangesController = () => {
  const state = useRef<ChangeState>('interaction');

  const subscribersRef = useRef(new Map<HTMLElement, Subscriber>());
  const sortedElements = useRef<{ depth: number; handle: Subscriber }[]>([]);

  const endBatch = useCallback(() => {
    state.current = 'interaction';
  }, []);

  return useMemo(() => ({
    state: () => state.current,
    startBatch: () => {
      state.current = 'batch';
      sortedElements.current.forEach(({ handle }) => handle?.before?.());
    },
    applyBatch: () => {
      sortedElements.current.forEach(({ handle }) => {
        try {
          handle?.apply?.();
        } catch (error) {
          // TODO: Handle error
        }
      });

      endBatch();
    },
    endBatch,
    subscribeBatch: (element: HTMLElement, subscriber: Subscriber) => {
      subscribersRef.current.set(element, subscriber);

      let depth = 0;
      let current: Node | null = element;

      while (current) {
        depth += 1;
        current = current.parentNode;
      }

      const elementToSort = { depth, handle: subscriber };

      sortedElements.current.push(elementToSort);
      // TODO: Use priority queue or a linked list
      sortedElements.current.sort((a, b) => b.depth - a.depth);

      return () => {
        subscribersRef.current.delete(element);

        const index = sortedElements.current.indexOf(elementToSort);
        if (index >= 0) {
          sortedElements.current.splice(index, 1);
        }
      };
    },
  }), [endBatch]);
};

export type ChangesController = ReturnType<typeof useChangesController>;
