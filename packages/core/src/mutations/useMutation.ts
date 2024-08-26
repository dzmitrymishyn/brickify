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
  const { subscribe } = useMutations()!;

  assert(
    subscribe,
    'You cannot subscribe on new mutations without the context',
  );

  const mutateRef = useRef(mutate);
  const ref = useRef<Element>(null);

  mutateRef.current = mutate;

  useEffect(() => {
    assert(ref.current, 'useMutation: ref should be attached to a node');

    return subscribe(
      ref.current,
      (mutation) => mutateRef.current?.(mutation),
    );
  }, [mutate, subscribe]);

  return ref;
};
