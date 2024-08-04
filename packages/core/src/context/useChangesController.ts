import { useCallback, useMemo, useRef } from 'react';

import { type Change, type ChangeState } from '../changes';
import { type BrickStore } from '../store';

export const useChangesController = (
  store: BrickStore,
  onChange: (...changes: Change[]) => void,
) => {
  const state = useRef<ChangeState>('interaction');

  const currentChanges = useRef<Change[]>([]);
  const markedForChanges = useRef<Node[]>([]);

  const handle = useCallback(<T>(
    fn: (params: T) => void,
    iterationState: ChangeState = 'interaction',
  ) => (params: T) => {
    state.current = iterationState;
    currentChanges.current = [];
    markedForChanges.current = [];

    fn(params);

    const handledNodes = new Set<Node>();
    markedForChanges.current.forEach((node) => {
      if (handledNodes.has(node)) {
        return;
      }
      handledNodes.add(node);

      try {
        store.get(node)?.applyChanges?.();
      } catch (error) {
        // TODO: Handle errors
      }
    });

    if (currentChanges.current.length) {
      onChange(...currentChanges.current);
    }

    markedForChanges.current = [];
    currentChanges.current = [];
    state.current = 'interaction';
  }, [onChange, store]);

  return useMemo(() => ({
    state: () => state.current,
    handle,

    markForApply: (node?: Node) => {
      if (!node) {
        // eslint-disable-next-line no-console -- Add warn message
        console.warn('node should be specified');
        return;
      }
      markedForChanges.current.push(node);
    },
    changes: () => currentChanges.current,
    onChange: (...changes: Change[]) => {
      if (!changes.length) {
        return;
      }

      currentChanges.current.push(...changes);
    },
    subscribeApply: (element: HTMLElement, applyChanges: () => void) => {
      store.update(element, { applyChanges });

      return () => {
        store.update(element, { applyChanges: undefined });
      };
    },
  }), [handle, store]);
};

export type ChangesController = ReturnType<typeof useChangesController>;
