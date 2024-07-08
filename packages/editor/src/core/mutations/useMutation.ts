import {
  type RefObject,
  useEffect,
  useRef,
} from 'react';

import {
  type MutationHandler,
} from './mutations';
import { useBrickContext } from '../hooks/useBrickContext';
import assert from 'assert';

export const useMutation = <Element extends HTMLElement>(
  mutate: MutationHandler,
): RefObject<Element> => {
  const { subscribeMutation } = useBrickContext();

  assert(
    subscribeMutation,
    'You cannot subscribe on new mutations without the context',
  );

  const mutateRef = useRef(mutate);
  const ref = useRef<Element>(null);

  mutateRef.current = mutate;

  useEffect(() => {
    assert(ref.current, 'useMutation: ref should be attached to a node');

    return subscribeMutation(
      ref.current,
      (mutation) => mutateRef.current?.(mutation),
    );
  }, [mutate, subscribeMutation]);

  return ref;
};
