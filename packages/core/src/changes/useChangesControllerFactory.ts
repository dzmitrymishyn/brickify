import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/lib/function';
import { useCallback, useMemo, useRef } from 'react';

import { type Change, type ChangeState } from './models';
import { subscribeFactory } from '../utils';

export const useChangesControllerFactory = (
  onChangeProp?: (...changes: Change[]) => void,
) => {
  const stateRef = useRef<ChangeState>('interaction');
  const store = useRef(new Map<Node, () => void>());

  const changesRef = useRef<Change[]>([]);
  const markedForChangesRef = useRef<Node[]>([]);
  const onChangesRef = useRef(onChangeProp);

  onChangesRef.current = onChangeProp;

  const apply = useCallback(() => pipe(
    markedForChangesRef.current,
    A.reduce(new Set<Node>(), (handledNodes, node: Node) => {
      if (!handledNodes.has(node)) {
        handledNodes.add(node);
        store.current.get(node)?.();
      }

      return handledNodes;
    }),
    () => changesRef.current.length
      && onChangesRef.current?.(...changesRef.current),
  ), []);

  const clear = useCallback((state: ChangeState) => {
    stateRef.current = state;
    changesRef.current = [];
    markedForChangesRef.current = [];
  }, []);

  return useMemo(() => ({
    state: () => stateRef.current,
    changes: () => changesRef.current,

    markForApply: (node?: Node) => {
      if (node) {
        markedForChangesRef.current.push(node);
      }
    },

    handle: <T>(
      fn?: (params: T) => void,
      state: ChangeState = 'interaction',
    ) => (params: T) => {
      clear(state);

      fn?.(params);
      apply();

      clear('interaction');
    },

    subscribeApply: subscribeFactory(store.current),

    onChange: <Value = unknown>(event: Change<Value>) => {
      if (!event.path) {
        return;
      }

      if (!changesRef.current.length) {
        requestAnimationFrame(apply);
      }

      changesRef.current.push(event);
    },
  }), [apply, clear]);
};

export type ChangesController = ReturnType<typeof useChangesControllerFactory>;
