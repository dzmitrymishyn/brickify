import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { useBrickContext } from './useBrickContext';
import {
  type MutationHandler,
  type MutationMutate,
} from '../mutations';
import assert from 'assert';

type Options = Partial<{
  after: () => void;
  before: () => void;
  mutate: (mutation: MutationMutate) => void;
}>;

export const useMutation = <Element extends HTMLElement>(
  mutations: Options,
): RefObject<Element> => {
  const { subscribeMutation } = useBrickContext();

  assert(
    subscribeMutation,
    'You cannot subscribe on new mutations without the context',
  );

  const mutationsRef = useRef(mutations);
  const ref = useRef<Element>(null);

  mutationsRef.current = mutations;

  const mutate = useCallback<MutationHandler>(
    (mutation) => {
      if (mutation.type === 'mutate') {
        return mutationsRef.current[mutation.type]?.(mutation);
      }
      return mutationsRef.current[mutation.type]?.();
    },
    [],
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    return subscribeMutation(ref.current, mutate);
  }, [mutate, subscribeMutation]);

  return ref;
};
