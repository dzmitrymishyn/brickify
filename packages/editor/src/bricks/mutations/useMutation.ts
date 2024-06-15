import {
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import {
  type MutationHandler,
  type MutationMutate,
} from './mutations';
import { MutationsContext } from './MutationsContext';

type Options = Partial<{
  after: () => void;
  before: () => void;
  mutate: (mutation: MutationMutate) => void;
}>;

export const useMutation = <Element extends HTMLElement>(
  mutations: Options,
): RefObject<Element> => {
  const { subscribe } = useContext(MutationsContext) ?? {};

  if (!subscribe) {
    // eslint-disable-next-line -- TODO: Check it
    console.error('You cannot subscribe on new mutations without the context');
  }

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
    if (!subscribe || !ref.current) {
      return;
    }

    return subscribe(ref.current, mutate);
  }, [mutate, subscribe]);

  return ref;
};
