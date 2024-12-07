import { useSyncedRef } from '@brickifyio/utils/hooks';
import {
  type RefObject,
  useEffect,
  useRef,
} from 'react';

import {
  type MutationHandler,
} from './mutations';
import { useMutations } from './useMutationsPluginFactory';
import assert from 'assert';

export const useMutation = <Element extends HTMLElement>(
  mutate: MutationHandler,
): RefObject<Element> => {
  const { subscribe } = useMutations();

  const mutateRef = useSyncedRef(mutate);
  const ref = useRef<Element>(null);

  useEffect(() => {
    assert(ref.current, 'ref for useMutation should be attached to a node');

    return subscribe(
      ref.current,
      (mutation) => mutateRef.current?.(mutation),
    );
  }, [mutate, subscribe, mutateRef]);

  return ref;
};

/**
 * I have DOM.
 * In this DOM I can perform as many mutations I can.
 *
 * Each node should say that this mutation was OK and we need to revert it.
 * Do I need to introduce method markForRevert?. How should it work
 *
 * E.g. I can go through a lot of levels of mutations and each level can have
 * the same mutations. What I can do in this case?
 *
 * Ok, I can find the nearest brick and pass the mutation to this brick.
 * A Component catch the changes, make a new value and send this value to the
 * revertion.
 */
